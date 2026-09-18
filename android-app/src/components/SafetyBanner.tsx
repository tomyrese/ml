import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RobotStateType, SafetyStateType } from '../types/protocol';
import { ConnectionStatus } from '../types/robot';

interface Props {
  robotState: RobotStateType;
  safetyState: SafetyStateType;
  personDetected: boolean;
  personConfidence?: number;
  connectionStatus: ConnectionStatus;
  isEmergencyStopped: boolean;
}

export const SafetyBanner: React.FC<Props> = ({
  robotState,
  safetyState,
  personDetected,
  personConfidence = 0,
  connectionStatus,
  isEmergencyStopped,
}) => {
  if (isEmergencyStopped || safetyState === 'ERROR_STOP') {
    return (
      <View style={[styles.banner, styles.dangerBanner]}>
        <Text style={styles.bannerTitle}>⚠️ DỪNG KHẨN CẤP (EMERGENCY STOP)</Text>
        <Text style={styles.bannerSubtitle}>Động cơ đã ngắt toàn bộ. Hãy reset sau khi khu vực an toàn.</Text>
      </View>
    );
  }

  if (personDetected || safetyState === 'PERSON_DETECTED' || robotState === 'PERSON_DETECTED') {
    const confPercent = Math.round(personConfidence * 100);
    return (
      <View style={[styles.banner, styles.warningBanner]}>
        <Text style={styles.bannerTitle}>⚠️ PHÁT HIỆN NGƯỜI PHÍA TRƯỚC ({confPercent}%)</Text>
        <Text style={styles.bannerSubtitle}>ROBOT ĐÃ TỰ ĐỘNG DỪNG. Khóa di chuyển đang kích hoạt.</Text>
      </View>
    );
  }

  if (robotState === 'CAMERA_ERROR') {
    return (
      <View style={[styles.banner, styles.dangerBanner]}>
        <Text style={styles.bannerTitle}>⚠️ LỖI CAMERA CSI</Text>
        <Text style={styles.bannerSubtitle}>Mất luồng camera an toàn. Khóa di chuyển robot.</Text>
      </View>
    );
  }

  if (connectionStatus !== 'CONNECTED') {
    return (
      <View style={[styles.banner, styles.disconnectedBanner]}>
        <Text style={styles.bannerTitle}>⚠️ MẤT KẾT NỐI VỚI ROBOT</Text>
        <Text style={styles.bannerSubtitle}>Robot đã dừng an toàn. Đang chờ kết nối lại...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
  },
  dangerBanner: {
    backgroundColor: '#4A0E0E',
    borderColor: '#FF1744',
  },
  warningBanner: {
    backgroundColor: '#4A3B00',
    borderColor: '#FFD600',
  },
  disconnectedBanner: {
    backgroundColor: '#301824',
    borderColor: '#E040FB',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 2,
  },
});
