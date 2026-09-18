import pytest
from starlette.testclient import TestClient
from src.config import RobotConfig
from src.services.robot_controller import RobotController

@pytest.fixture
def client():
    cfg = RobotConfig(SIMULATION_MODE=True, PAIRING_CODE_TTL=60.0)
    robot = RobotController(cfg)
    robot.start(start_server=False)
    tc = TestClient(robot.api_app)
    yield tc, robot
    robot.shutdown()

def test_health_endpoint(client):
    tc, _ = client
    res = tc.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "robotState" in data
    assert "server" in data and data["server"] is True

def test_info_endpoint(client):
    tc, _ = client
    res = tc.get("/api/v1/info")
    assert res.status_code == 200
    data = res.json()
    assert data["robotId"] == "RBT01"
    assert data["apiVersion"] == "v1"
    assert data["protocolVersion"] == 1

def test_status_endpoint(client):
    tc, _ = client
    res = tc.get("/api/v1/status")
    assert res.status_code == 200
    data = res.json()
    assert "robotState" in data
    assert "motorSpeeds" in data

def test_pairing_flow(client):
    tc, robot = client
    robot.trigger_pairing_mode()
    code = robot.pairing_manager.current_code
    assert code is not None

    fail_res = tc.post("/api/v1/pair", json={"pairCode": "INVALID"})
    assert fail_res.status_code == 200
    assert fail_res.json()["success"] is False

    success_res = tc.post("/api/v1/pair", json={"pairCode": code})
    assert success_res.status_code == 200
    data = success_res.json()
    assert data["success"] is True
    assert "token" in data
    token = data["token"]

    ticket_res = tc.get("/api/v1/camera/ticket", headers={"Authorization": f"Bearer {token}"})
    assert ticket_res.status_code == 200
    assert "ticket" in ticket_res.json()
    ticket = ticket_res.json()["ticket"]

    snap_res = tc.get(f"/api/v1/camera/snapshot?ticket={ticket}")
    assert snap_res.status_code == 200
    assert snap_res.headers["content-type"] == "image/jpeg"

    del_res = tc.delete("/api/v1/session", headers={"Authorization": f"Bearer {token}"})
    assert del_res.status_code == 200

    unauth_ticket = tc.get("/api/v1/camera/ticket", headers={"Authorization": f"Bearer {token}"})
    assert unauth_ticket.status_code == 401

def test_emergency_stop_and_reset(client):
    tc, robot = client
    token = robot.auth_manager.create_session_token()

    estop_res = tc.post("/api/v1/emergency-stop")
    assert estop_res.status_code == 200
    assert estop_res.json()["success"] is True
    assert robot.safety.is_emergency_stopped

    reset_res = tc.post("/api/v1/emergency-reset", headers={"Authorization": f"Bearer {token}"})
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True
    assert not robot.safety.is_emergency_stopped

def test_public_config_endpoint(client):
    tc, _ = client
    res = tc.get("/api/v1/config/public")
    assert res.status_code == 200
    data = res.json()
    assert "defaultSpeed" in data
    assert "speedRange" in data
    assert "stopZone" in data
