export type RobotStateType =
  | 'BOOTING'
  | 'READY'
  | 'PAIRING'
  | 'CONNECTED'
  | 'FORWARD'
  | 'BACKWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'STOPPED'
  | 'PERSON_DETECTED'
  | 'SAFETY_STOP'
  | 'CAMERA_ERROR'
  | 'MOTOR_ERROR'
  | 'SYSTEM_ERROR'
  | 'DISCONNECTED'
  | 'SHUTTING_DOWN';

export type SafetyStateType = 'CLEAR' | 'PERSON_DETECTED' | 'SAFETY_STOP' | 'ERROR_STOP';

export interface TelemetryData {
  type: 'telemetry';
  robotState: RobotStateType;
  safetyState: SafetyStateType;
  speed: number;
  leftSpeed: number;
  rightSpeed: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  personDetected: boolean;
  personConfidence: number;
  cameraOk: boolean;
  detectorOk: boolean;
  oledOk: boolean;
  motorOk: boolean;
  cameraFps: number;
  inferenceFps: number;
  cpuTemp?: number | null;
  cpuUsage?: number | null;
  memoryUsage?: number | null;
  wifiSignal?: number | null;
  uptime: number;
  timestamp: number;
  personBbox?: [number, number, number, number] | null;
}

export interface SafetyEventData {
  type: 'safety_event';
  event: 'person_detected' | 'person_clear' | 'emergency_stop' | 'camera_error' | 'connection_lost';
  confidence?: number;
}

export interface CommandAckData {
  type: 'command_ack';
  seq?: number;
  accepted: boolean;
  reason?: string;
}

export interface HelloAckData {
  type: 'hello_ack';
  protocol: number;
  robotId: string;
  robotName: string;
  state: RobotStateType;
}

export interface ErrorData {
  type: 'error';
  code: string;
  message: string;
}

export interface PairResponse {
  success: boolean;
  token?: string;
  robotId: string;
  robotName: string;
  message?: string;
}

export interface HealthResponse {
  status: string;
  robotState: RobotStateType;
  safetyState: SafetyStateType;
  camera: boolean;
  detector: boolean;
  motor: boolean;
  oled: boolean;
  server: boolean;
}

export interface InfoResponse {
  robotId: string;
  robotName: string;
  apiVersion: string;
  protocolVersion: number;
  hostname: string;
  serverVersion: string;
  paired: boolean;
}
