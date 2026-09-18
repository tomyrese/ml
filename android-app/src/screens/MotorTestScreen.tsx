import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRobotStore } from '../store/robotStore';
import { RobotSocket } from '../services/RobotSocket';
import { ConnectionBadge } from '../components/ConnectionBadge';

const MOTORS = [
  { id: 1, name: 'Motor 1 (Trái Trước)', channel: 'TB_L Channel A' },
  { id: 2, name: 'Motor 2 (Trái Sau)', channel: 'TB_L Channel B' },
  { id: 3, name: 'Motor 3 (Phải Trước)', channel: 'TB_R Channel A' },
  { id: 4, name: 'Motor 4 (Phải Sau)', channel: 'TB_R Channel B' },
];

export const MotorTestScreen: React.FC = () => {
  const { connectionStatus, pairedRobot, telemetry, isSafetyBlocked, isEmergencyStopped } =
    useRobotStore();

  const handleMotorPress = (motorId: number, speed: number) => {
    RobotSocket.getInstance().sendMotorTest(motorId, speed);
  };

  const handleMotorRelease = (motorId: number) => {
    RobotSocket.getInstance().sendMotorTest(motorId, 0.0);
  };

  const handleStopAll = () => {
    RobotSocket.getInstance().sendStop();
  };

  const isDisabled =
    connectionStatus !== 'CONNECTED' || isSafetyBlocked || isEmergencyStopped;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <ConnectionBadge
          status={connectionStatus}
          robotName={pairedRobot?.robotName || 'Pi Robot'}
        />
      </View>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>⚠️ CHẾ ĐỘ BẢO TRÌ & KIỂM TRA ĐỘNG CƠ</Text>
        <Text style={styles.warningDesc}>
          Chỉ thực hiện khi robot đã được kê bánh lên không chạm đất để kiểm tra chiều quay từng
          động cơ (Tốc độ test cố định 20%). Nhấn giữ để quay, thả tay để dừng.
        </Text>
      </View>

      {MOTORS.map(m => {
        let currentSpd = 0.0;
        if (telemetry) {
          if (m.id === 1) currentSpd = telemetry.m1;
          if (m.id === 2) currentSpd = telemetry.m2;
          if (m.id === 3) currentSpd = telemetry.m3;
          if (m.id === 4) currentSpd = telemetry.m4;
        }

        return (
          <View key={m.id} style={styles.motorCard}>
            <View style={styles.motorHeader}>
              <View>
                <Text style={styles.motorName}>{m.name}</Text>
                <Text style={styles.motorChannel}>{m.channel}</Text>
              </View>
              <Text
                style={[
                  styles.speedBadge,
                  Math.abs(currentSpd) > 0.01 && styles.speedActive,
                ]}>
                {Math.round(currentSpd * 100)}%
              </Text>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.testBtn, styles.fwBtn, isDisabled && styles.disabledBtn]}
                disabled={isDisabled}
                onPressIn={() => handleMotorPress(m.id, 0.20)}
                onPressOut={() => handleMotorRelease(m.id)}>
                <Text style={styles.fwBtnText}>▲ TIẾN (FWD)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testBtn, styles.revBtn, isDisabled && styles.disabledBtn]}
                disabled={isDisabled}
                onPressIn={() => handleMotorPress(m.id, -0.20)}
                onPressOut={() => handleMotorRelease(m.id)}>
                <Text style={styles.revBtnText}>▼ LÙI (REV)</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.stopAllBtn, isDisabled && styles.disabledBtn]}
        disabled={isDisabled}
        onPress={handleStopAll}>
        <Text style={styles.stopAllText}>🛑 DỪNG TẤT CẢ MOTOR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  topBar: {
    marginBottom: 8,
  },
  warningBox: {
    backgroundColor: '#3E2723',
    borderColor: '#FF5722',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    color: '#FFAB91',
    fontWeight: '800',
    fontSize: 13,
  },
  warningDesc: {
    color: '#ECEFF1',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  motorCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  motorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  motorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  motorChannel: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  speedBadge: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: '#121214',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  speedActive: {
    color: '#00E676',
    borderColor: '#00E676',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  fwBtn: {
    backgroundColor: '#1B382B',
    borderColor: '#00E676',
  },
  fwBtnText: {
    color: '#00E676',
    fontWeight: '800',
    fontSize: 12,
  },
  revBtn: {
    backgroundColor: '#38231B',
    borderColor: '#FF9100',
  },
  revBtnText: {
    color: '#FF9100',
    fontWeight: '800',
    fontSize: 12,
  },
  disabledBtn: {
    opacity: 0.35,
  },
  stopAllBtn: {
    backgroundColor: '#D50000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  stopAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
