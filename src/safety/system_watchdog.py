import time
from typing import Optional
from src.config import RobotConfig, config
from src.services.logging_service import logger

class SystemWatchdog:
    def __init__(self, cfg: Optional[RobotConfig] = None, max_consecutive_errors: int = 5):
        self.cfg = cfg or config
        self.max_consecutive_errors = max_consecutive_errors
        self.consecutive_errors = 0
        self.last_heartbeat = time.monotonic()

    def heartbeat(self):
        self.last_heartbeat = time.monotonic()
        self.consecutive_errors = 0

    def record_error(self, err: Exception) -> bool:
        self.consecutive_errors += 1
        logger.error(f"SystemWatchdog recorded error ({self.consecutive_errors}/{self.max_consecutive_errors}): {err}")
        return self.consecutive_errors >= self.max_consecutive_errors

    def is_healthy(self) -> bool:
        return self.consecutive_errors < self.max_consecutive_errors
