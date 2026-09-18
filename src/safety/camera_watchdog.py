import time
from typing import Optional
from src.config import RobotConfig, config
from src.services.logging_service import logger

class CameraWatchdog:
    def __init__(self, cfg: Optional[RobotConfig] = None):
        self.cfg = cfg or config
        self.timeout = self.cfg.CAMERA_WATCHDOG_TIMEOUT
        self.last_frame_time = time.monotonic()
        self.last_inference_time = time.monotonic()
        self.has_timed_out = False

    def feed_frame(self, timestamp: Optional[float] = None):
        self.last_frame_time = timestamp if timestamp is not None and timestamp > 0 else time.monotonic()
        self.has_timed_out = False

    def feed_inference(self, timestamp: Optional[float] = None):
        self.last_inference_time = timestamp if timestamp is not None and timestamp > 0 else time.monotonic()

    def check(self, is_moving: bool) -> bool:
        if not self.cfg.CAMERA_ENABLED:
            return True

        now = time.monotonic()
        frame_gap = now - self.last_frame_time
        inference_gap = now - self.last_inference_time

        if frame_gap > self.timeout or inference_gap > (self.timeout * 1.5):
            if not self.has_timed_out:
                self.has_timed_out = True
                logger.error(f"CAMERA_WATCHDOG_TIMEOUT frame_gap={frame_gap:.2f}s inference_gap={inference_gap:.2f}s is_moving={is_moving}")
            return False

        self.has_timed_out = False
        return True
