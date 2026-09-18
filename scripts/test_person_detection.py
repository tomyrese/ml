import time
import sys
import os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.hardware.camera_service import CameraService
from src.vision.person_detector import PersonDetector

def main():
    print("=== PERSON DETECTION TEST ===")
    cam = CameraService(config)
    detector = PersonDetector(config)

    ok = cam.start()
    if not ok:
        print("ERROR: Could not start camera.")
        sys.exit(1)

    has_display = bool(os.getenv("DISPLAY")) or os.name == "nt"
    show_preview = ("--preview" in sys.argv or config.DEBUG_PREVIEW) and has_display
    cv2_module = None

    if show_preview:
        try:
            import cv2
            cv2_module = cv2
        except ImportError:
            show_preview = False

    print(f"Detector Runtime: {detector.runtime}")
    print(f"Stop Zone X: [{config.STOP_ZONE_X_MIN:.2f}, {config.STOP_ZONE_X_MAX:.2f}]")
    print(f"Confidence Threshold: {config.PERSON_CONFIDENCE_THRESHOLD}")
    print("Press Ctrl+C or 'q' in preview window to exit.\n")

    frame_count = 0
    fps_start = time.monotonic()
    calc_fps = 0.0

    try:
        while True:
            frame, ts = cam.get_latest_frame()
            if frame is None:
                time.sleep(0.01)
                continue

            detections = detector.detect(frame)
            frame_count += 1

            now = time.monotonic()
            if now - fps_start >= 1.0:
                calc_fps = frame_count / (now - fps_start)
                frame_count = 0
                fps_start = now

            if detections.detections:
                print(f"[FPS: {calc_fps:.1f}] Detections: {len(detections.detections)} | StopZone: {detections.has_person_in_stop_zone} | MaxConf: {detections.max_confidence_in_stop_zone:.2f} | InfTime: {detections.inference_time_ms:.1f}ms")
                for d in detections.detections:
                    print(f"   - Class: {d.class_name}, Conf: {d.confidence:.2f}, Box: ({d.bbox[0]:.2f}, {d.bbox[1]:.2f}, {d.bbox[2]:.2f}, {d.bbox[3]:.2f}), Area: {d.area_ratio:.3f}, InStopZone: {d.in_stop_zone}")

            if show_preview and cv2_module is not None:
                bgr = cv2_module.cvtColor(frame, cv2_module.COLOR_RGB2BGR)
                h, w = bgr.shape[:2]

                sz_x1 = int(config.STOP_ZONE_X_MIN * w)
                sz_x2 = int(config.STOP_ZONE_X_MAX * w)
                cv2_module.rectangle(bgr, (sz_x1, 0), (sz_x2, h), (0, 255, 255), 1)
                cv2_module.putText(bgr, "STOP ZONE", (sz_x1 + 5, 20), cv2_module.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

                for d in detections.detections:
                    x1 = int(d.bbox[0] * w)
                    y1 = int(d.bbox[1] * h)
                    x2 = int(d.bbox[2] * w)
                    y2 = int(d.bbox[3] * h)

                    color = (0, 0, 255) if d.in_stop_zone else (0, 255, 0)
                    cv2_module.rectangle(bgr, (x1, y1), (x2, y2), color, 2)
                    label = f"Person {int(d.confidence*100)}%"
                    cv2_module.putText(bgr, label, (x1, max(20, y1 - 10)), cv2_module.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                status_txt = f"FPS: {calc_fps:.1f} | Inference: {detections.inference_time_ms:.1f}ms"
                cv2_module.putText(bgr, status_txt, (10, h - 10), cv2_module.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

                cv2_module.imshow("Person Detection Test", bgr)
                if cv2_module.waitKey(1) & 0xFF == ord('q'):
                    break

            time.sleep(0.01)
    except KeyboardInterrupt:
        print("\nStopping person detection test...")
    finally:
        cam.stop()
        if show_preview and cv2_module is not None:
            cv2_module.destroyAllWindows()

if __name__ == "__main__":
    main()
