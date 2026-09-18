import { RobotStateType, SafetyStateType, TelemetryData } from './protocol';

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'FAILED';

export interface PairedRobotInfo {
  robotId: string;
  robotName: string;
  host: string;
  port: number;
  token: string;
  lastConnected: number;
}

export interface AppSettings {
  defaultSpeed: number;
  enableCameraPreview: boolean;
  autoReconnect: boolean;
  mjpegQuality: number;
}

export interface RobotStoreState {
  connectionStatus: ConnectionStatus;
  pairedRobot: PairedRobotInfo | null;
  settings: AppSettings;
  telemetry: TelemetryData | null;
  robotState: RobotStateType;
  safetyState: SafetyStateType;
  personDetected: boolean;
  personConfidence: number;
  isEmergencyStopped: boolean;
  isSafetyBlocked: boolean;
  lastError: string | null;
  logs: string[];
}
