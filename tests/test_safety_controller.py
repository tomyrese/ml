import time
import pytest
from src.config import RobotConfig
from src.state import SafetyState, RobotState
from src.safety.safety_controller import SafetyController
from src.vision.detection_types import FrameDetections, Detection

@pytest.fixture
def safety_ctrl():
    cfg = RobotConfig(
        PERSON_CONFIDENCE_THRESHOLD=0.55,
        PERSON_CLEAR_DELAY=0.1,
        PERSON_DETECTED_CONFIRM_FRAMES=1
    )
    return SafetyController(cfg)

def create_frame_detection(has_person: bool, conf: float = 0.85):
    if has_person:
        det = Detection(
            class_name="person",
            confidence=conf,
            bbox=(0.3, 0.1, 0.7, 0.9),
            center_x=0.5,
            center_y=0.5,
            area_ratio=0.32,
            in_stop_zone=True,
            timestamp=time.monotonic()
        )
        return FrameDetections(
            timestamp=time.monotonic(),
            detections=[det],
            has_person_in_stop_zone=True,
            max_confidence_in_stop_zone=conf
        )
    return FrameDetections(
        timestamp=time.monotonic(),
        detections=[],
        has_person_in_stop_zone=False,
        max_confidence_in_stop_zone=0.0
    )

def test_initial_state_is_clear(safety_ctrl):
    assert safety_ctrl.safety_state == SafetyState.CLEAR
    assert safety_ctrl.can_move()
    assert not safety_ctrl.person_active

def test_detection_triggers_safety_stop(safety_ctrl):
    frame_det = create_frame_detection(True, 0.8)
    should_stop = safety_ctrl.update_vision_safety(frame_det, is_moving=True)

    assert should_stop
    assert safety_ctrl.person_active
    assert safety_ctrl.safety_state == SafetyState.SAFETY_STOP
    assert not safety_ctrl.can_move()

def test_clear_delay_behavior(safety_ctrl):
    frame_det = create_frame_detection(True, 0.8)
    safety_ctrl.update_vision_safety(frame_det, is_moving=True)

    empty_det = create_frame_detection(False)
    safety_ctrl.update_vision_safety(empty_det, is_moving=False)
    assert not safety_ctrl.can_move()

    time.sleep(0.15)
    safety_ctrl.update_vision_safety(empty_det, is_moving=False)
    assert not safety_ctrl.person_active
    assert safety_ctrl.can_move()
    assert safety_ctrl.safety_state == SafetyState.CLEAR

def test_emergency_stop_lifecycle(safety_ctrl):
    safety_ctrl.trigger_emergency_stop()
    assert safety_ctrl.is_emergency_stopped
    assert not safety_ctrl.can_move()

    success = safety_ctrl.reset_emergency_stop()
    assert success
    assert not safety_ctrl.is_emergency_stopped
    assert safety_ctrl.can_move()

def test_cannot_reset_estop_if_person_active(safety_ctrl):
    frame_det = create_frame_detection(True, 0.85)
    safety_ctrl.update_vision_safety(frame_det, is_moving=False)
    safety_ctrl.trigger_emergency_stop()

    success = safety_ctrl.reset_emergency_stop()
    assert not success
    assert safety_ctrl.is_emergency_stopped
