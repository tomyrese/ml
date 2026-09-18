import pytest
from src.config import RobotConfig
from src.hardware.motor_controller import MotorController

@pytest.fixture
def motor_ctrl():
    cfg = RobotConfig(SIMULATION_MODE=True, DEFAULT_SPEED=0.35)
    ctrl = MotorController(cfg)
    ctrl.enable()
    yield ctrl
    ctrl.cleanup()

def test_initial_state(motor_ctrl):
    motor_ctrl.disable()
    assert not motor_ctrl.enabled
    assert not motor_ctrl.is_moving()
    speeds = motor_ctrl.get_speeds()
    assert all(spd == 0.0 for spd in speeds.values())

def test_forward_mapping(motor_ctrl):
    motor_ctrl.forward(0.5)
    speeds = motor_ctrl.get_speeds()
    assert speeds[1] == 0.5
    assert speeds[2] == 0.5
    assert speeds[3] == 0.5
    assert speeds[4] == 0.5
    assert motor_ctrl.is_moving()

def test_backward_mapping(motor_ctrl):
    motor_ctrl.backward(0.4)
    speeds = motor_ctrl.get_speeds()
    assert speeds[1] == -0.4
    assert speeds[2] == -0.4
    assert speeds[3] == -0.4
    assert speeds[4] == -0.4

def test_turn_left_mapping(motor_ctrl):
    motor_ctrl.turn_left(0.3)
    speeds = motor_ctrl.get_speeds()
    assert speeds[1] == -0.3
    assert speeds[2] == -0.3
    assert speeds[3] == 0.3
    assert speeds[4] == 0.3

def test_turn_right_mapping(motor_ctrl):
    motor_ctrl.turn_right(0.3)
    speeds = motor_ctrl.get_speeds()
    assert speeds[1] == 0.3
    assert speeds[2] == 0.3
    assert speeds[3] == -0.3
    assert speeds[4] == -0.3

def test_stop_action(motor_ctrl):
    motor_ctrl.forward(0.5)
    assert motor_ctrl.is_moving()
    motor_ctrl.stop()
    assert not motor_ctrl.is_moving()
    speeds = motor_ctrl.get_speeds()
    assert all(spd == 0.0 for spd in speeds.values())

def test_emergency_stop_disables_controller(motor_ctrl):
    motor_ctrl.forward(0.5)
    motor_ctrl.emergency_stop()
    assert not motor_ctrl.enabled
    assert not motor_ctrl.is_moving()

def test_clamped_speed(motor_ctrl):
    motor_ctrl.drive_motor(1, 1.5)
    assert motor_ctrl.get_speeds()[1] == 1.0
    motor_ctrl.drive_motor(2, -2.0)
    assert motor_ctrl.get_speeds()[2] == -1.0

def test_invalid_motor_index(motor_ctrl):
    with pytest.raises(ValueError):
        motor_ctrl.drive_motor(5, 0.5)
    with pytest.raises(ValueError):
        motor_ctrl.drive_motor(0, 0.5)
