import time
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.state import RobotState
from src.hardware.oled_controller import OLEDController

def main():
    print("=== OLED DISPLAY TEST ===")
    oled = OLEDController(config)
    if not oled.available:
        print("WARNING: OLED hardware not detected or running in simulation.")
    else:
        print("OLED hardware initialized successfully.")

    screens = [
        (RobotState.BOOTING, {}),
        (RobotState.READY, {"ip": "192.168.1.50"}),
        (RobotState.FORWARD, {"speed": 0.35}),
        (RobotState.TURN_LEFT, {"speed": 0.35}),
        (RobotState.PERSON_DETECTED, {"confidence": 0.88}),
        (RobotState.SAFETY_STOP, {}),
        (RobotState.CAMERA_ERROR, {}),
        (RobotState.SHUTTING_DOWN, {})
    ]

    for state, info in screens:
        print(f"Displaying state: {state.value}")
        oled.update_state(state, info)
        time.sleep(1.2)

    oled.cleanup()
    print("OLED test completed.")

if __name__ == "__main__":
    main()
