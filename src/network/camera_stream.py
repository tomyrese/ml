import asyncio
import io
import time
from typing import Optional, AsyncGenerator
import numpy as np
from PIL import Image
from src.config import RobotConfig, config
from src.hardware.camera_service import CameraService
from src.services.logging_service import logger

class CameraStreamManager:
    def __init__(self, camera_service: CameraService, cfg: Optional[RobotConfig] = None):
        self.camera_service = camera_service
        self.cfg = cfg or config
        self.stream_fps = self.cfg.CAMERA_STREAM_FPS
        self.quality = self.cfg.CAMERA_JPEG_QUALITY

    def encode_frame_to_jpeg(self, frame: Optional[np.ndarray]) -> bytes:
        if frame is None:
            blank = np.zeros((self.cfg.CAMERA_STREAM_HEIGHT, self.cfg.CAMERA_STREAM_WIDTH, 3), dtype=np.uint8)
            img = Image.fromarray(blank)
        else:
            img = Image.fromarray(frame)
            if img.size != (self.cfg.CAMERA_STREAM_WIDTH, self.cfg.CAMERA_STREAM_HEIGHT):
                img = img.resize((self.cfg.CAMERA_STREAM_WIDTH, self.cfg.CAMERA_STREAM_HEIGHT), resample=Image.BILINEAR)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=self.quality, optimize=True)
        return buf.getvalue()

    def get_snapshot(self) -> bytes:
        frame, _ = self.camera_service.get_latest_frame()
        return self.encode_frame_to_jpeg(frame)

    async def generate_mjpeg_stream(self) -> AsyncGenerator[bytes, None]:
        frame_interval = 1.0 / max(1.0, self.stream_fps)
        while True:
            start_time = time.monotonic()
            frame, _ = self.camera_service.get_latest_frame()
            jpeg_bytes = self.encode_frame_to_jpeg(frame)

            header = (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n"
                b"Content-Length: " + str(len(jpeg_bytes)).encode("utf-8") + b"\r\n\r\n"
            )
            yield header + jpeg_bytes + b"\r\n"

            elapsed = time.monotonic() - start_time
            sleep_time = max(0.01, frame_interval - elapsed)
            await asyncio.sleep(sleep_time)
