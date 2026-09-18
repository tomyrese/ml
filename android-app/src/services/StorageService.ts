import AsyncStorage from '@react-native-async-storage/async-storage';
import { PairedRobotInfo, AppSettings } from '../types/robot';

const KEY_PAIRED_ROBOT = '@pi_robot_paired_info';
const KEY_SETTINGS = '@pi_robot_settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultSpeed: 0.35,
  enableCameraPreview: true,
  autoReconnect: true,
  mjpegQuality: 70,
};

export class StorageService {
  static async savePairedRobot(info: PairedRobotInfo): Promise<void> {
    try {
      const json = JSON.stringify(info);
      await AsyncStorage.setItem(KEY_PAIRED_ROBOT, json);
    } catch (e) {}
  }

  static async getPairedRobot(): Promise<PairedRobotInfo | null> {
    try {
      const json = await AsyncStorage.getItem(KEY_PAIRED_ROBOT);
      if (!json) {
        return null;
      }
      return JSON.parse(json) as PairedRobotInfo;
    } catch (e) {
      return null;
    }
  }

  static async clearPairedRobot(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEY_PAIRED_ROBOT);
    } catch (e) {}
  }

  static async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));
    } catch (e) {}
  }

  static async getSettings(): Promise<AppSettings> {
    try {
      const json = await AsyncStorage.getItem(KEY_SETTINGS);
      if (!json) {
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
}
