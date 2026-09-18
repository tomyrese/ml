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
        <Text style={styles.bannerTitle}>🛑 DỪNG KHẨN CẤP (EMERGENCY ACTIVE)</Text>
        <Text style={styles.bannerSubtitle}>Động cơ đã ngắt toàn bộ nguồn. Hãy reset sau khi khu vực an toàn.</Text>
      </View>
    );
  }

  if (personDetected || safetyState === 'PERSON_DETECTED' || robotState === 'PERSON_DETECTED') {
    const confPercent = Math.round(personConfidence * 100);
    return (
      <View style={[styles.banner, styles.warningBanner]}>
        <Text style={styles.bannerTitle}>⚠️ PHÁT HIỆN NGƯỜI PHÍA TRƯỚC ({confPercent}%)</Text>
        <Text style={styles.bannerSubtitle}>ROBOT ĐÃ TỰ ĐỘNG DỪNG. Khóa di chuyển an toàn đang kích hoạt.</Text>
      </View>
    );
  }

  if (robotState === 'CAMERA_ERROR') {
    return (
      <View style={[styles.banner, styles.dangerBanner]}>
        <Text style={styles.bannerTitle}>📷 LỖI CAMERA CSI AN TOÀN</Text>
        <Text style={styles.bannerSubtitle}>Mất luồng camera an toàn. Khóa di chuyển robot tự động.</Text>
      </View>
    );
  }

  if (connectionStatus !== 'CONNECTED') {
    return (
      <View style={[styles.banner, styles.disconnectedBanner]}>
        <Text style={styles.bannerTitle}>📡 MẤT KẾT NỐI WEBSOCKET ROBOT</Text>
        <Text style={styles.bannerSubtitle}>Robot đã dừng an toàn (Fail-Safe Stop). Đang chờ kết nối lại...</Text>
      </View>
    );
  }

  return (
    <View style={styles.clearBanner}>
      <View style={styles.clearDot} />
      <Text style={styles.clearText}>HỆ THỐNG AN TOÀN SẴN SÀNG (ALL CLEAR)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1.5,
    elevation: 4,
  },
  dangerBanner: {
    backgroundColor: '#350A10',
    borderColor: '#FF1744',
  },
  warningBanner: {
    backgroundColor: '#382205',
    borderColor: '#FFB300',
  },
  disconnectedBanner: {
    backgroundColor: '#261224',
    borderColor: '#E040FB',
  },
  clearBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1718',
    borderColor: '#19392C',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 4,
    gap: 8,
  },
  clearDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
  },
  clearText: {
    color: '#81C784',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    color: '#ECEFF1',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
});
