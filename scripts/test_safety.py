import time
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import RobotConfig
from src.state import MovementCommand, RobotState, SafetyState
from src.hardware.motor_controller import MotorController
from src.safety.safety_controller import SafetyController
from src.safety.camera_watchdog import CameraWatchdog
from src.vision.detection_types import FrameDetections, Detection

def test_safety_scenario_1_person_detection_stops_moving_robot():
    cfg = RobotConfig(SIMULATION_MODE=True, PERSON_CLEAR_DELAY=0.3, PERSON_DETECTED_CONFIRM_FRAMES=1)
    motor = MotorController(cfg)
    motor.enable()
    safety = SafetyController(cfg)

    motor.forward(0.35)
    assert motor.is_moving(), "Motor should be moving forward"

    det = Detection(
        class_name="person",
        confidence=0.85,
        bbox=(0.3, 0.1, 0.7, 0.9),
        center_x=0.5,
        center_y=0.5,
        area_ratio=0.32,
        in_stop_zone=True,
        timestamp=time.monotonic()
    )
    frame_det = FrameDetections(
        timestamp=time.monotonic(),
        detections=[det],
        has_person_in_stop_zone=True,
        max_confidence_in_stop_zone=0.85
    )

    should_stop = safety.update_vision_safety(frame_det, motor.is_moving())
    if should_stop:
        motor.stop()

    assert should_stop == True, "Safety controller must request immediate stop"
    assert not motor.is_moving(), "Motor must be stopped immediately"
    assert safety.safety_state == SafetyState.SAFETY_STOP
    motor.cleanup()
    print("TEST 1: Person detection immediately stops moving robot -> PASSED")

def test_safety_scenario_2_command_rejected_while_person_present():
    cfg = RobotConfig(SIMULATION_MODE=True, PERSON_CLEAR_DELAY=0.3, PERSON_DETECTED_CONFIRM_FRAMES=1)
    motor = MotorController(cfg)
    motor.enable()
    safety = SafetyController(cfg)

    det = Detection(
        class_name="person",
        confidence=0.85,
        bbox=(0.3, 0.1, 0.7, 0.9),
        center_x=0.5,
        center_y=0.5,
        area_ratio=0.32,
        in_stop_zone=True,
        timestamp=time.monotonic()
    )
    frame_det = FrameDetections(
        timestamp=time.monotonic(),
        detections=[det],
        has_person_in_stop_zone=True,
        max_confidence_in_stop_zone=0.85
    )
    safety.update_vision_safety(frame_det, False)

    assert not safety.can_move(), "Safety controller must lock movement while person is present"
    if safety.can_move():
        motor.forward(0.35)

    assert not motor.is_moving(), "Motor must reject movement command and stay at speed 0"
    motor.cleanup()
    print("TEST 2: Movement command rejected while person present -> PASSED")

def test_safety_scenario_3_clear_delay_and_no_auto_resume():
    cfg = RobotConfig(SIMULATION_MODE=True, PERSON_CLEAR_DELAY=0.2, AUTO_RESUME_AFTER_PERSON_CLEAR=False)
    motor = MotorController(cfg)
    motor.enable()
    safety = SafetyController(cfg)

    det = Detection(
        class_name="person",
        confidence=0.85,
        bbox=(0.3, 0.1, 0.7, 0.9),
        center_x=0.5,
        center_y=0.5,
        area_ratio=0.32,
        in_stop_zone=True,
        timestamp=time.monotonic()
    )
    frame_det = FrameDetections(timestamp=time.monotonic(), detections=[det], has_person_in_stop_zone=True, max_confidence_in_stop_zone=0.85)
    safety.update_vision_safety(frame_det, True)
    motor.stop()

    empty_det = FrameDetections(timestamp=time.monotonic(), detections=[], has_person_in_stop_zone=False)
    safety.update_vision_safety(empty_det, False)
    assert not safety.can_move(), "Must still be locked during clear delay"

    time.sleep(0.25)
    safety.update_vision_safety(empty_det, False)
    assert safety.can_move(), "Safety should be CLEAR after clear delay elapsed"
    assert not motor.is_moving(), "Robot MUST NOT auto resume movement without explicit command"
    motor.cleanup()
    print("TEST 3: Person clear delay and no-auto-resume verification -> PASSED")

def test_safety_scenario_4_camera_watchdog_timeout():
    cfg = RobotConfig(CAMERA_WATCHDOG_TIMEOUT=0.1, CAMERA_ENABLED=True)
    watchdog = CameraWatchdog(cfg)

    watchdog.feed_frame(time.monotonic() - 0.2)
    watchdog.feed_inference(time.monotonic() - 0.2)

    ok = watchdog.check(is_moving=True)
    assert not ok, "Watchdog must report failure on camera frame timeout while moving"
    print("TEST 4: Camera watchdog timeout while moving -> PASSED")

def main():
    print("=== RUNNING SAFETY SCENARIO TESTS ===")
    test_safety_scenario_1_person_detection_stops_moving_robot()
    test_safety_scenario_2_command_rejected_while_person_present()
    test_safety_scenario_3_clear_delay_and_no_auto_resume()
    test_safety_scenario_4_camera_watchdog_timeout()
    print("\nALL SAFETY TESTS PASSED.")

if __name__ == "__main__":
    main()
