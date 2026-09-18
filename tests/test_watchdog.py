import time
from src.config import RobotConfig
from src.safety.camera_watchdog import CameraWatchdog
from src.safety.system_watchdog import SystemWatchdog

def test_camera_watchdog_healthy():
    cfg = RobotConfig(CAMERA_WATCHDOG_TIMEOUT=1.0, CAMERA_ENABLED=True)
    wd = CameraWatchdog(cfg)
    wd.feed_frame(time.monotonic())
    wd.feed_inference(time.monotonic())
    assert wd.check(is_moving=True)

def test_camera_watchdog_timeout():
    cfg = RobotConfig(CAMERA_WATCHDOG_TIMEOUT=0.05, CAMERA_ENABLED=True)
    wd = CameraWatchdog(cfg)
    wd.feed_frame(time.monotonic() - 0.1)
    wd.feed_inference(time.monotonic() - 0.1)
    assert not wd.check(is_moving=True)

def test_camera_watchdog_disabled_passes():
    cfg = RobotConfig(CAMERA_ENABLED=False)
    wd = CameraWatchdog(cfg)
    assert wd.check(is_moving=True)

def test_system_watchdog_error_tracking():
    cfg = RobotConfig()
    wd = SystemWatchdog(cfg, max_consecutive_errors=3)
    assert wd.is_healthy()

    wd.record_error(RuntimeError("error 1"))
    assert wd.is_healthy()

    wd.record_error(RuntimeError("error 2"))
    assert wd.is_healthy()

    critical = wd.record_error(RuntimeError("error 3"))
    assert critical
    assert not wd.is_healthy()

    wd.heartbeat()
    assert wd.is_healthy()
