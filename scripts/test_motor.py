import time
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import config
from src.hardware.motor_controller import MotorController

def main():
    print("=== MOTOR HARDWARE STEP-BY-STEP TEST ===")
    print("WARNING: Place the robot on a stand so wheels can rotate freely in the air!")
    print("Mapping:")
    print("  Motor 1 = Left Front (TB_L Channel A)")
    print("  Motor 2 = Left Rear  (TB_L Channel B)")
    print("  Motor 3 = Right Front (TB_R Channel A)")
    print("  Motor 4 = Right Rear  (TB_R Channel B)")

    confirm = input("\nDo you want to proceed with individual motor tests? (y/n): ").strip().lower()
    if confirm != "y":
        print("Motor test aborted by user.")
        sys.exit(0)

    print("\nStarting in 3 seconds...")
    for i in range(3, 0, -1):
        print(f"  {i}...")
        time.sleep(1.0)

    motor = MotorController(config)
    motor.enable()

    test_speed = 0.20
    duration = 0.4
    pause = 0.4

    tests = [
        (1, test_speed, "Motor 1 FORWARD"),
        (1, -test_speed, "Motor 1 REVERSE"),
        (2, test_speed, "Motor 2 FORWARD"),
        (2, -test_speed, "Motor 2 REVERSE"),
        (3, test_speed, "Motor 3 FORWARD"),
        (3, -test_speed, "Motor 3 REVERSE"),
        (4, test_speed, "Motor 4 FORWARD"),
        (4, -test_speed, "Motor 4 REVERSE"),
    ]

    try:
        for idx, spd, desc in tests:
            print(f"\nTesting: {desc} (Speed: {spd})")
            motor.drive_motor(idx, spd)
            time.sleep(duration)
            motor.drive_motor(idx, 0.0)
            time.sleep(pause)

        print("\nAll individual motor tests finished.")
    finally:
        motor.cleanup()

if __name__ == "__main__":
    main()
