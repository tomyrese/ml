import {
  TelemetryData,
  SafetyEventData,
  CommandAckData,
  HelloAckData,
  ErrorData,
} from '../types/protocol';
import { ConnectionStatus } from '../types/robot';

type TelemetryListener = (data: TelemetryData) => void;
type SafetyEventListener = (data: SafetyEventData) => void;
type StatusListener = (status: ConnectionStatus) => void;
type AckListener = (ack: CommandAckData) => void;

export class RobotSocket {
  private static instance: RobotSocket | null = null;

  private ws: WebSocket | null = null;
  private host = '';
  private port = 8765;
  private token = '';
  private status: ConnectionStatus = 'DISCONNECTED';
  private seq = 0;

  private heartbeatTimer: any = null;
  private driveTimer: any = null;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private currentDriveDirection: 'forward' | 'backward' | 'left' | 'right' | null = null;
  private currentDriveSpeed = 0.35;

  private telemetryListeners: Set<TelemetryListener> = new Set();
  private safetyEventListeners: Set<SafetyEventListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private ackListeners: Set<AckListener> = new Set();

  public static getInstance(): RobotSocket {
    if (!RobotSocket.instance) {
      RobotSocket.instance = new RobotSocket();
    }
    return RobotSocket.instance;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public setStatus(newStatus: ConnectionStatus) {
    this.status = newStatus;
    this.statusListeners.forEach(listener => listener(newStatus));
  }

  public addTelemetryListener(cb: TelemetryListener) {
    this.telemetryListeners.add(cb);
    return () => this.telemetryListeners.delete(cb);
  }

  public addSafetyEventListener(cb: SafetyEventListener) {
    this.safetyEventListeners.add(cb);
    return () => this.safetyEventListeners.delete(cb);
  }

  public addStatusListener(cb: StatusListener) {
    this.statusListeners.add(cb);
    cb(this.status);
    return () => this.statusListeners.delete(cb);
  }

  public addAckListener(cb: AckListener) {
    this.ackListeners.add(cb);
    return () => this.ackListeners.delete(cb);
  }

  public connect(host: string, port: number, token: string) {
    this.disconnect();

    this.host = host;
    this.port = port;
    this.token = token;
    this.setStatus('CONNECTING');

    const url = `ws://${host}:${port}/ws/v1/control?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (e) {
      this.setStatus('FAILED');
      this.scheduleReconnect();
    }
  }

  private handleOpen() {
    this.setStatus('AUTHENTICATING');
    this.reconnectAttempts = 0;

    this.send({
      type: 'hello',
      protocol: 1,
      client: 'android',
      appVersion: '1.0.0',
    });

    this.startHeartbeat();
  }

  private handleMessage(event: WebSocketMessageEvent) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'hello_ack') {
        this.setStatus('CONNECTED');
      } else if (data.type === 'telemetry') {
        this.telemetryListeners.forEach(l => l(data as TelemetryData));
      } else if (data.type === 'safety_event') {
        this.safetyEventListeners.forEach(l => l(data as SafetyEventData));
      } else if (data.type === 'command_ack') {
        this.ackListeners.forEach(l => l(data as CommandAckData));
      } else if (data.type === 'error') {
        if (data.code === 'AUTH_INVALID') {
          this.setStatus('FAILED');
          this.disconnect();
        }
      }
    } catch (e) {}
  }

  private handleError() {
    this.stopDriveLoop();
    if (this.status !== 'FAILED') {
      this.setStatus('FAILED');
    }
  }

  private handleClose(event: WebSocketCloseEvent) {
    this.stopHeartbeat();
    this.stopDriveLoop();

    if (event.code === 4003 || event.code === 4001) {
      this.setStatus('FAILED');
    } else {
      this.setStatus('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(5000, 1000 * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      if (this.status === 'DISCONNECTED' || this.status === 'FAILED') {
        this.setStatus('RECONNECTING');
        this.connect(this.host, this.port, this.token);
      }
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', timestamp: Date.now() / 1000.0 });
      }
    }, 400);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (e) {}
    }
  }

  public startDriveLoop(direction: 'forward' | 'backward' | 'left' | 'right', speed: number) {
    this.currentDriveDirection = direction;
    this.currentDriveSpeed = speed;

    this.sendDriveMessage();

    if (this.driveTimer) {
      clearInterval(this.driveTimer);
    }

    this.driveTimer = setInterval(() => {
      this.sendDriveMessage();
    }, 100);
  }

  private sendDriveMessage() {
    if (!this.currentDriveDirection) {
      return;
    }
    this.seq++;
    this.send({
      type: 'drive',
      direction: this.currentDriveDirection,
      speed: this.currentDriveSpeed,
      seq: this.seq,
    });
  }

  public updateDriveSpeed(speed: number) {
    this.currentDriveSpeed = speed;
    if (this.currentDriveDirection) {
      this.sendDriveMessage();
    }
  }

  public stopDriveLoop() {
    if (this.driveTimer) {
      clearInterval(this.driveTimer);
      this.driveTimer = null;
    }
    this.currentDriveDirection = null;
    this.sendStop();
  }

  public sendStop() {
    this.seq++;
    this.send({
      type: 'stop',
      seq: this.seq,
    });
  }

  public sendTankDrive(left: number, right: number) {
    this.seq++;
    this.send({
      type: 'tank_drive',
      left,
      right,
      seq: this.seq,
    });
  }

  public sendMotorTest(motor: number, speed: number) {
    this.seq++;
    this.send({
      type: 'motor_test',
      motor,
      speed,
      seq: this.seq,
    });
  }

  public sendEmergencyStop() {
    this.stopDriveLoop();
    this.send({
      type: 'emergency_stop',
    });
  }

  public sendEmergencyReset() {
    this.send({
      type: 'emergency_reset',
    });
  }

  public disconnect() {
    this.stopHeartbeat();
    this.stopDriveLoop();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.setStatus('DISCONNECTED');
  }
}
