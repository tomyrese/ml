import { AppState, AppStateStatus } from 'react-native';
import { RobotSocket } from './RobotSocket';

export class AppLifecycleService {
  private static subscription: any = null;

  static init() {
    if (this.subscription) {
      return;
    }

    this.subscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private static handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      const socket = RobotSocket.getInstance();
      socket.stopDriveLoop();
      socket.sendStop();
    }
  };

  static cleanup() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}
