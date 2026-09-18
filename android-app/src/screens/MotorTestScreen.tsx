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
  { id: 1, name: 'Motor 1 (Trái Trước)', channel: 'TB_L Channel A', pin: 'GPIO13 / GPIO5,6' },
  { id: 2, name: 'Motor 2 (Trái Sau)', channel: 'TB_L Channel B', pin: 'GPIO19 / GPIO26,22' },
  { id: 3, name: 'Motor 3 (Phải Trước)', channel: 'TB_R Channel A', pin: 'GPIO12 / GPIO16,20' },
  { id: 4, name: 'Motor 4 (Phải Sau)', channel: 'TB_R Channel B', pin: 'GPIO18 / GPIO23,24' },
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
          robotName={pairedRobot?.robotName || 'RBT01'}
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

        const isActive = Math.abs(currentSpd) > 0.01;

        return (
          <View key={m.id} style={[styles.motorCard, isActive && styles.motorCardActive]}>
            <View style={styles.motorHeader}>
              <View>
                <Text style={styles.motorName}>{m.name}</Text>
                <Text style={styles.motorChannel}>{m.channel} • {m.pin}</Text>
              </View>
              <Text
                style={[
                  styles.speedBadge,
                  isActive && styles.speedActive,
                ]}>
                {Math.round(currentSpd * 100)}%
              </Text>
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.testBtn, styles.fwBtn, isDisabled && styles.disabledBtn]}
                disabled={isDisabled}
                onPressIn={() => handleMotorPress(m.id, 0.20)}
                onPressOut={() => handleMotorRelease(m.id)}>
                <Text style={styles.fwBtnText}>▲ QUAY TIẾN (FWD)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.testBtn, styles.revBtn, isDisabled && styles.disabledBtn]}
                disabled={isDisabled}
                onPressIn={() => handleMotorPress(m.id, -0.20)}
                onPressOut={() => handleMotorRelease(m.id)}>
                <Text style={styles.revBtnText}>▼ QUAY LÙI (REV)</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        activeOpacity={0.8}
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
    backgroundColor: '#0A0D14',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  topBar: {
    marginBottom: 8,
  },
  warningBox: {
    backgroundColor: '#2A1808',
    borderColor: '#FF6D00',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    color: '#FFAB40',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  warningDesc: {
    color: '#ECEFF1',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  motorCard: {
    backgroundColor: '#141822',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#242B38',
    elevation: 3,
  },
  motorCardActive: {
    borderColor: '#00E676',
    backgroundColor: '#0C2018',
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
    fontWeight: '900',
  },
  motorChannel: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  speedBadge: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '900',
    backgroundColor: '#0A0D14',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242B38',
  },
  speedActive: {
    color: '#00E676',
    borderColor: '#00E676',
    backgroundColor: '#0A2518',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  fwBtn: {
    backgroundColor: '#0C2218',
    borderColor: '#00E676',
  },
  fwBtnText: {
    color: '#00E676',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  revBtn: {
    backgroundColor: '#261908',
    borderColor: '#FF9100',
  },
  revBtnText: {
    color: '#FF9100',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  disabledBtn: {
    opacity: 0.35,
  },
  stopAllBtn: {
    backgroundColor: '#B71C1C',
    borderColor: '#FF1744',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 6,
  },
  stopAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
