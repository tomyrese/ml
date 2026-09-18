import time
from typing import Optional, Tuple
from src.config import RobotConfig, config
from src.services.logging_service import logger

class ConnectionWatchdog:
    def __init__(self, cfg: Optional[RobotConfig] = None):
        self.cfg = cfg or config
        self.connection_timeout = self.cfg.CONNECTION_TIMEOUT
        self.drive_lease_timeout = self.cfg.DRIVE_COMMAND_TIMEOUT
        self.last_heartbeat_time = 0.0
        self.last_drive_time = 0.0
        self.is_connected = False
        self.drive_lease_active = False

    def on_connected(self):
        now = time.monotonic()
        self.last_heartbeat_time = now
        self.last_drive_time = 0.0
        self.is_connected = True
        self.drive_lease_active = False

    def feed_heartbeat(self):
        self.last_heartbeat_time = time.monotonic()

    def feed_drive_command(self):
        now = time.monotonic()
        self.last_drive_time = now
        self.last_heartbeat_time = now
        self.drive_lease_active = True

    def check(self) -> Tuple[bool, bool]:
        if not self.is_connected:
            return False, False

        now = time.monotonic()
        connection_alive = (now - self.last_heartbeat_time) <= self.connection_timeout
        drive_valid = self.drive_lease_active and ((now - self.last_drive_time) <= self.drive_lease_timeout)

        if not connection_alive and self.is_connected:
            logger.warning(f"CONNECTION_TIMEOUT elapsed={now - self.last_heartbeat_time:.2f}s")
            self.is_connected = False
            self.drive_lease_active = False

        if not drive_valid and self.drive_lease_active:
            self.drive_lease_active = False

        return connection_alive, drive_valid

    def on_disconnected(self):
        self.is_connected = False
        self.drive_lease_active = False
        self.last_heartbeat_time = 0.0
        self.last_drive_time = 0.0
