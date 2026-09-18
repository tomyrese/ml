import time
from typing import Optional
from src.config import RobotConfig, config
from src.state import SafetyState, RobotState, MovementCommand
from src.vision.detection_types import FrameDetections
from src.services.logging_service import logger

class SafetyController:
    def __init__(self, cfg: Optional[RobotConfig] = None):
        self.cfg = cfg or config
        self.safety_state = SafetyState.CLEAR
        self.is_emergency_stopped = False
        self.has_camera_error = False
        self.has_motor_error = False
        self.has_system_error = False
        self.person_detected_frames = 0
        self.last_person_time = 0.0
        self.person_active = False

    def update_vision_safety(self, detections: FrameDetections, is_moving: bool) -> bool:
        now = time.monotonic()
        should_stop = False

        if detections.has_person_in_stop_zone:
            self.person_detected_frames += 1
            self.last_person_time = now

            if self.person_detected_frames >= self.cfg.PERSON_DETECTED_CONFIRM_FRAMES or detections.max_confidence_in_stop_zone >= self.cfg.PERSON_CONFIDENCE_THRESHOLD:
                if not self.person_active:
                    self.person_active = True
                    logger.warning(f"PERSON_DETECTED confidence={detections.max_confidence_in_stop_zone:.2f}")
                self.safety_state = SafetyState.SAFETY_STOP
                if is_moving:
                    should_stop = True
                    logger.warning("SAFETY_STOP reason=person_detected")
        else:
            self.person_detected_frames = 0
            if self.person_active:
                if now - self.last_person_time >= self.cfg.PERSON_CLEAR_DELAY:
                    self.person_active = False
                    logger.info("PERSON_CLEAR")
                    if self.safety_state == SafetyState.SAFETY_STOP:
                        self.safety_state = SafetyState.CLEAR

        return should_stop

    def set_camera_error(self, error: bool):
        self.has_camera_error = error
        if error:
            self.safety_state = SafetyState.ERROR_STOP

    def set_motor_error(self, error: bool):
        self.has_motor_error = error
        if error:
            self.safety_state = SafetyState.ERROR_STOP

    def set_system_error(self, error: bool):
        self.has_system_error = error
        if error:
            self.safety_state = SafetyState.ERROR_STOP

    def trigger_emergency_stop(self):
        self.is_emergency_stopped = True
        self.safety_state = SafetyState.ERROR_STOP
        logger.warning("EMERGENCY_STOP activated")

    def reset_emergency_stop(self) -> bool:
        if self.person_active:
            logger.warning("Cannot reset emergency stop while person is in stop zone")
            return False
        if self.has_camera_error or self.has_motor_error or self.has_system_error:
            logger.warning("Cannot reset emergency stop while system errors exist")
            return False

        self.is_emergency_stopped = False
        self.safety_state = SafetyState.CLEAR
        logger.info("EMERGENCY_STOP reset successful")
        return True

    def can_move(self) -> bool:
        if self.is_emergency_stopped:
            return False
        if self.has_system_error or self.has_motor_error or self.has_camera_error:
            return False
        if self.person_active:
            return False
        if self.safety_state != SafetyState.CLEAR:
            return False
        return True

    def get_effective_robot_state(self, current_motion_state: RobotState) -> RobotState:
        if self.is_emergency_stopped:
            return RobotState.SAFETY_STOP
        if self.has_system_error:
            return RobotState.SYSTEM_ERROR
        if self.has_motor_error:
            return RobotState.MOTOR_ERROR
        if self.has_camera_error:
            return RobotState.CAMERA_ERROR
        if self.person_active:
            return RobotState.PERSON_DETECTED
        if self.safety_state == SafetyState.SAFETY_STOP:
            return RobotState.SAFETY_STOP
        return current_motion_state
