import { useState, useEffect } from 'react';
import { TelemetryData, SafetyEventData, CommandAckData } from '../types/protocol';
import { ConnectionStatus, PairedRobotInfo, AppSettings, RobotStoreState } from '../types/robot';
import { RobotSocket } from '../services/RobotSocket';
import { StorageService } from '../services/StorageService';

let globalState: RobotStoreState = {
  connectionStatus: 'DISCONNECTED',
  pairedRobot: null,
  settings: {
    defaultSpeed: 0.35,
    enableCameraPreview: true,
    autoReconnect: true,
    mjpegQuality: 70,
  },
  telemetry: null,
  robotState: 'STOPPED',
  safetyState: 'CLEAR',
  personDetected: false,
  personConfidence: 0.0,
  isEmergencyStopped: false,
  isSafetyBlocked: false,
  lastError: null,
  logs: [],
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

export function updateGlobalState(updater: (prev: RobotStoreState) => Partial<RobotStoreState>) {
  const partial = updater(globalState);
  globalState = { ...globalState, ...partial };
  notify();
}

export function initializeStore() {
  StorageService.getPairedRobot().then(robot => {
    if (robot) {
      updateGlobalState(() => ({ pairedRobot: robot }));
    }
  });

  StorageService.getSettings().then(settings => {
    updateGlobalState(() => ({ settings }));
  });

  const socket = RobotSocket.getInstance();

  socket.addStatusListener(status => {
    updateGlobalState(() => ({ connectionStatus: status }));
  });

  socket.addTelemetryListener(telemetry => {
    const isEStop = telemetry.safetyState === 'ERROR_STOP' || telemetry.robotState === 'SAFETY_STOP';
    const isBlocked = telemetry.personDetected || telemetry.safetyState !== 'CLEAR';

    updateGlobalState(() => ({
      telemetry,
      robotState: telemetry.robotState,
      safetyState: telemetry.safetyState,
      personDetected: telemetry.personDetected,
      personConfidence: telemetry.personConfidence,
      isEmergencyStopped: isEStop,
      isSafetyBlocked: isBlocked,
    }));
  });

  socket.addSafetyEventListener(event => {
    if (event.event === 'person_detected') {
      updateGlobalState(prev => ({
        personDetected: true,
        personConfidence: event.confidence || 0.85,
        isSafetyBlocked: true,
        logs: [`[${new Date().toLocaleTimeString()}] PERSON DETECTED`, ...prev.logs.slice(0, 49)],
      }));
    } else if (event.event === 'person_clear') {
      updateGlobalState(prev => ({
        personDetected: false,
        isSafetyBlocked: false,
        logs: [`[${new Date().toLocaleTimeString()}] PERSON CLEAR`, ...prev.logs.slice(0, 49)],
      }));
    } else if (event.event === 'emergency_stop') {
      updateGlobalState(prev => ({
        isEmergencyStopped: true,
        isSafetyBlocked: true,
        logs: [`[${new Date().toLocaleTimeString()}] EMERGENCY STOP TRIGGERED`, ...prev.logs.slice(0, 49)],
      }));
    }
  });

  socket.addAckListener(ack => {
    if (!ack.accepted && ack.reason) {
      updateGlobalState(prev => ({
        lastError: ack.reason || 'Command rejected',
        logs: [`[${new Date().toLocaleTimeString()}] REJECTED: ${ack.reason}`, ...prev.logs.slice(0, 49)],
      }));
    }
  });
}

export function useRobotStore(): RobotStoreState {
  const [state, setState] = useState<RobotStoreState>(globalState);

  useEffect(() => {
    const listener = () => setState(globalState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}
