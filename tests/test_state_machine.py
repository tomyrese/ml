from src.state import RobotState, SafetyState, MovementCommand

def test_robot_state_values():
    assert RobotState.BOOTING.value == "BOOTING"
    assert RobotState.READY.value == "READY"
    assert RobotState.FORWARD.value == "FORWARD"
    assert RobotState.BACKWARD.value == "BACKWARD"
    assert RobotState.TURN_LEFT.value == "TURN_LEFT"
    assert RobotState.TURN_RIGHT.value == "TURN_RIGHT"
    assert RobotState.STOPPED.value == "STOPPED"
    assert RobotState.PERSON_DETECTED.value == "PERSON_DETECTED"
    assert RobotState.SAFETY_STOP.value == "SAFETY_STOP"
    assert RobotState.CAMERA_ERROR.value == "CAMERA_ERROR"
    assert RobotState.MOTOR_ERROR.value == "MOTOR_ERROR"
    assert RobotState.SYSTEM_ERROR.value == "SYSTEM_ERROR"
    assert RobotState.SHUTTING_DOWN.value == "SHUTTING_DOWN"

def test_safety_state_values():
    assert SafetyState.CLEAR.value == "CLEAR"
    assert SafetyState.PERSON_DETECTED.value == "PERSON_DETECTED"
    assert SafetyState.SAFETY_STOP.value == "SAFETY_STOP"
    assert SafetyState.ERROR_STOP.value == "ERROR_STOP"

def test_movement_command_values():
    assert MovementCommand.FORWARD.value == "FORWARD"
    assert MovementCommand.BACKWARD.value == "BACKWARD"
    assert MovementCommand.TURN_LEFT.value == "TURN_LEFT"
    assert MovementCommand.TURN_RIGHT.value == "TURN_RIGHT"
    assert MovementCommand.STOP.value == "STOP"
    assert MovementCommand.EMERGENCY_STOP.value == "EMERGENCY_STOP"
