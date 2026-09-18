import time

def current_time_monotonic() -> float:
    return time.monotonic()

def current_time_ms() -> float:
    return time.monotonic() * 1000.0

class RateLimiter:
    def __init__(self, interval_seconds: float):
        self.interval = interval_seconds
        self.last_run_time = 0.0

    def ready(self) -> bool:
        now = time.monotonic()
        if now - self.last_run_time >= self.interval:
            self.last_run_time = now
            return True
        return False

    def reset(self):
        self.last_run_time = 0.0
