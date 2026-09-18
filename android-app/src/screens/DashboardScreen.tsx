import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRobotStore } from '../store/robotStore';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { SafetyBanner } from '../components/SafetyBanner';
import { RobotStatusCard } from '../components/RobotStatusCard';
import { EmergencyButton } from '../components/EmergencyButton';
import { RobotLogo } from '../components/RobotLogo';
import { RobotSocket } from '../services/RobotSocket';

interface Props {
  navigation: any;
}

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const {
    connectionStatus,
    pairedRobot,
    telemetry,
    robotState,
    safetyState,
    personDetected,
    personConfidence,
    isEmergencyStopped,
  } = useRobotStore();

  const handleEmergencyStop = () => {
    RobotSocket.getInstance().sendEmergencyStop();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <RobotLogo size={36} />
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>PI ROBOT</Text>
            <Text style={styles.brandSub}>CENTRAL COMMAND</Text>
          </View>
        </View>

        <ConnectionBadge
          status={connectionStatus}
          robotName={pairedRobot?.robotName || 'RBT01'}
        />
      </View>

      <SafetyBanner
        robotState={robotState}
        safetyState={safetyState}
        personDetected={personDetected}
        personConfidence={personConfidence}
        connectionStatus={connectionStatus}
        isEmergencyStopped={isEmergencyStopped}
      />

      <RobotStatusCard telemetry={telemetry} />

      <Text style={styles.sectionTitle}>BẢNG ĐIỀU KHIỂN & CHỨC NĂNG</Text>
      <View style={styles.menuGrid}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.menuTile, styles.primaryTile]}
          onPress={() => navigation.navigate('Control')}>
          <View style={styles.tileHeader}>
            <Text style={styles.tileIcon}>🎮</Text>
            <View style={styles.tileBadgePrimary}>
              <Text style={styles.tileBadgeText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.tileTitle}>ĐIỀU KHIỂN</Text>
          <Text style={styles.tileSubtitle}>D-pad, Tốc độ, Phanh an toàn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.menuTile, styles.cameraTile]}
          onPress={() => navigation.navigate('Camera')}>
          <View style={styles.tileHeader}>
            <Text style={styles.tileIcon}>📷</Text>
            <View style={styles.tileBadgeCyan}>
              <Text style={styles.tileBadgeText}>CSI</Text>
            </View>
          </View>
          <Text style={styles.tileTitle}>CAMERA CSI</Text>
          <Text style={styles.tileSubtitle}>Video trực tiếp & AI Detector</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.menuTile}
          onPress={() => navigation.navigate('Diagnostics')}>
          <View style={styles.tileHeader}>
            <Text style={styles.tileIcon}>📊</Text>
          </View>
          <Text style={styles.tileTitle}>CHẨN ĐOÁN</Text>
          <Text style={styles.tileSubtitle}>Telemetry chi tiết & Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.menuTile}
          onPress={() => navigation.navigate('MotorTest')}>
          <View style={styles.tileHeader}>
            <Text style={styles.tileIcon}>🔧</Text>
          </View>
          <Text style={styles.tileTitle}>TEST MOTOR</Text>
          <Text style={styles.tileSubtitle}>Kiểm tra 4 motor DC độc lập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.menuTile, styles.fullWidthTile]}
          onPress={() => navigation.navigate('Settings')}>
          <View style={styles.fullWidthContent}>
            <Text style={styles.tileIconSmall}>⚙️</Text>
            <View style={styles.fullWidthTexts}>
              <Text style={styles.tileTitle}>CÀI ĐẶT HỆ THỐNG</Text>
              <Text style={styles.tileSubtitle}>Cấu hình kết nối, Tốc độ mặc định, Quản lý Robot</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.emergencySection}>
        <EmergencyButton onPress={handleEmergencyStop} />
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTextWrap: {},
  brandTitle: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSub: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  menuTile: {
    width: '48.5%',
    backgroundColor: '#141822',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#242B38',
    elevation: 3,
  },
  primaryTile: {
    borderColor: '#00E676',
    backgroundColor: '#0C2018',
  },
  cameraTile: {
    borderColor: '#00E5FF',
    backgroundColor: '#0A1E28',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileIcon: {
    fontSize: 26,
  },
  tileIconSmall: {
    fontSize: 22,
    marginRight: 10,
  },
  tileBadgePrimary: {
    backgroundColor: '#00E676',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tileBadgeCyan: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tileBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
  tileTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tileSubtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  fullWidthTile: {
    width: '100%',
    paddingVertical: 12,
  },
  fullWidthContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidthTexts: {
    flex: 1,
  },
  emergencySection: {
    marginTop: 18,
  },
});
