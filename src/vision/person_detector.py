import os
import time
from typing import Optional, List, Tuple
import numpy as np
from src.config import RobotConfig, config
from src.vision.detection_types import Detection, FrameDetections
from src.services.logging_service import logger

class PersonDetector:
    def __init__(self, cfg: Optional[RobotConfig] = None):
        self.cfg = cfg or config
        self.mock_mode = self.cfg.PERSON_DETECTION_MOCK
        self.mock_person_active = False
        self.mock_confidence = 0.85
        self.runtime = "none"
        self.interpreter = None
        self.onnx_session = None
        self.cv_net = None
        self.input_details = None
        self.output_details = None
        self.labels = {}
        self.person_class_ids = set()
        self.input_shape = (300, 300)
        self.is_quantized = False
        self.last_inference_time_ms = 0.0
        self.total_inferences = 0
        self.total_inference_time = 0.0

        if not self.mock_mode:
            self._load_labels()
            self._init_runtime()

    def _load_labels(self):
        if os.path.exists(self.cfg.LABELS_PATH):
            try:
                with open(self.cfg.LABELS_PATH, "r", encoding="utf-8") as f:
                    for idx, line in enumerate(f):
                        label = line.strip().lower()
                        self.labels[idx] = label
                        if label == "person":
                            self.person_class_ids.add(idx)
                            self.person_class_ids.add(idx + 1)
            except Exception as e:
                logger.warning(f"Failed to load labels from {self.cfg.LABELS_PATH}: {e}")
        if not self.person_class_ids:
            self.person_class_ids = {0, 1}

    def _init_runtime(self):
        model_path = self.cfg.MODEL_PATH
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found at {model_path}. Switching to fallback/mock detector.")
            self.runtime = "fallback"
            return

        if model_path.endswith(".tflite"):
            self._init_tflite(model_path)
        elif model_path.endswith(".onnx"):
            self._init_onnx(model_path)
        else:
            self._init_opencv_dnn(model_path)

    def _init_tflite(self, model_path: str):
        try:
            tflite_module = None
            try:
                import tflite_runtime.interpreter as tflite_module
            except ImportError:
                try:
                    import ai_edge_litert.interpreter as tflite_module
                except ImportError:
                    try:
                        import tensorflow.lite as tflite_module
                    except ImportError:
                        pass

            if tflite_module is None:
                raise ImportError("No tflite_runtime, ai_edge_litert, or tensorflow.lite found")

            self.interpreter = tflite_module.Interpreter(model_path=model_path, num_threads=4)
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            self.input_shape = (self.input_details[0]["shape"][1], self.input_details[0]["shape"][2])
            self.is_quantized = self.input_details[0]["dtype"] == np.uint8
            self.runtime = "tflite"
            logger.info(f"Loaded TFLite model: {model_path} ({self.input_shape[0]}x{self.input_shape[1]})")
        except Exception as e:
            logger.warning(f"Failed to initialize TFLite: {e}")
            self.runtime = "fallback"

    def _init_onnx(self, model_path: str):
        try:
            import onnxruntime as ort
            self.onnx_session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
            self.runtime = "onnx"
            logger.info(f"Loaded ONNX model: {model_path}")
        except Exception as e:
            logger.warning(f"Failed to initialize ONNX: {e}")
            self.runtime = "fallback"

    def _init_opencv_dnn(self, model_path: str):
        try:
            import cv2
            self.cv_net = cv2.dnn.readNet(model_path)
            self.cv_net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
            self.cv_net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
            self.runtime = "opencv_dnn"
            logger.info(f"Loaded OpenCV DNN model: {model_path}")
        except Exception as e:
            logger.warning(f"Failed to initialize OpenCV DNN: {e}")
            self.runtime = "fallback"

    def set_mock_person(self, detected: bool, confidence: float = 0.85):
        self.mock_person_active = detected
        self.mock_confidence = confidence

    def _check_stop_zone(self, bbox: Tuple[float, float, float, float], area_ratio: float) -> bool:
        x1, y1, x2, y2 = bbox
        center_x = (x1 + x2) / 2.0
        if area_ratio < self.cfg.PERSON_MIN_AREA_RATIO:
            return False
        overlap_min = max(x1, self.cfg.STOP_ZONE_X_MIN)
        overlap_max = min(x2, self.cfg.STOP_ZONE_X_MAX)
        if overlap_max > overlap_min:
            return True
        if self.cfg.STOP_ZONE_X_MIN <= center_x <= self.cfg.STOP_ZONE_X_MAX:
            return True
        return False

    def detect(self, frame: Optional[np.ndarray]) -> FrameDetections:
        start_time = time.monotonic()
        now = time.monotonic()

        if self.mock_mode or self.mock_person_active:
            elapsed_ms = (time.monotonic() - start_time) * 1000.0
            if self.mock_person_active:
                det = Detection(
                    class_name="person",
                    confidence=self.mock_confidence,
                    bbox=(0.3, 0.1, 0.7, 0.9),
                    center_x=0.5,
                    center_y=0.5,
                    area_ratio=0.32,
                    in_stop_zone=True,
                    timestamp=now
                )
                return FrameDetections(
                    timestamp=now,
                    detections=[det],
                    has_person_in_stop_zone=True,
                    max_confidence_in_stop_zone=self.mock_confidence,
                    inference_time_ms=elapsed_ms
                )
            return FrameDetections(timestamp=now, detections=[], has_person_in_stop_zone=False, max_confidence_in_stop_zone=0.0, inference_time_ms=elapsed_ms)

        if frame is None or self.runtime == "fallback":
            elapsed_ms = (time.monotonic() - start_time) * 1000.0
            return FrameDetections(timestamp=now, detections=[], has_person_in_stop_zone=False, max_confidence_in_stop_zone=0.0, inference_time_ms=elapsed_ms)

        detections: List[Detection] = []
        has_stop = False
        max_conf = 0.0

        try:
            if self.runtime == "tflite":
                detections, has_stop, max_conf = self._infer_tflite(frame, now)
        except Exception as e:
            logger.error(f"Inference error: {e}")

        elapsed_ms = (time.monotonic() - start_time) * 1000.0
        self.last_inference_time_ms = elapsed_ms
        self.total_inferences += 1
        self.total_inference_time += elapsed_ms

        return FrameDetections(
            timestamp=now,
            detections=detections,
            has_person_in_stop_zone=has_stop,
            max_confidence_in_stop_zone=max_conf,
            inference_time_ms=elapsed_ms
        )

    def _infer_tflite(self, frame: np.ndarray, timestamp: float) -> Tuple[List[Detection], bool, float]:
        import cv2
        h_orig, w_orig = frame.shape[:2]
        resized = cv2.resize(frame, (self.input_shape[1], self.input_shape[0]))
        input_data = np.expand_dims(resized, axis=0)

        if not self.is_quantized:
            input_data = (np.float32(input_data) - 127.5) / 127.5

        self.interpreter.set_tensor(self.input_details[0]["index"], input_data)
        self.interpreter.invoke()

        boxes = self.interpreter.get_tensor(self.output_details[0]["index"])[0]
        classes = self.interpreter.get_tensor(self.output_details[1]["index"])[0]
        scores = self.interpreter.get_tensor(self.output_details[2]["index"])[0]

        detections = []
        has_stop = False
        max_conf = 0.0

        for i in range(len(scores)):
            score = float(scores[i])
            if score < self.cfg.PERSON_CONFIDENCE_THRESHOLD:
                continue

            class_id = int(classes[i])
            label = self.labels.get(class_id, "unknown")
            if class_id not in self.person_class_ids and label != "person":
                continue

            ymin, xmin, ymax, xmax = boxes[i]
            x1, y1, x2, y2 = max(0.0, float(xmin)), max(0.0, float(ymin)), min(1.0, float(xmax)), min(1.0, float(ymax))
            width = x2 - x1
            height = y2 - y1
            area_ratio = width * height
            center_x = (x1 + x2) / 2.0
            center_y = (y1 + y2) / 2.0

            in_stop = self._check_stop_zone((x1, y1, x2, y2), area_ratio)
            if in_stop:
                has_stop = True
                if score > max_conf:
                    max_conf = score

            det = Detection(
                class_name="person",
                confidence=score,
                bbox=(x1, y1, x2, y2),
                center_x=center_x,
                center_y=center_y,
                area_ratio=area_ratio,
                in_stop_zone=in_stop,
                timestamp=timestamp
            )
            detections.append(det)

        return detections, has_stop, max_conf

    def get_average_inference_time_ms(self) -> float:
        if self.total_inferences == 0:
            return 0.0
        return self.total_inference_time / self.total_inferences
