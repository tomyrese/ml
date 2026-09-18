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
        <ConnectionBadge
          status={connectionStatus}
          robotName={pairedRobot?.robotName || 'Pi Robot'}
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

      <Text style={styles.sectionTitle}>CHỨC NĂNG ĐIỀU KHIỂN</Text>
      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={[styles.menuTile, styles.primaryTile]}
          onPress={() => navigation.navigate('Control')}>
          <Text style={styles.tileIcon}>🎮</Text>
          <Text style={styles.tileTitle}>ĐIỀU KHIỂN</Text>
          <Text style={styles.tileSubtitle}>D-pad, Tốc độ, Phản xạ an toàn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuTile}
          onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.tileIcon}>📷</Text>
          <Text style={styles.tileTitle}>CAMERA CSI</Text>
          <Text style={styles.tileSubtitle}>Video trực tiếp từ Pi 4</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuTile}
          onPress={() => navigation.navigate('Diagnostics')}>
          <Text style={styles.tileIcon}>📊</Text>
          <Text style={styles.tileTitle}>CHẨN ĐOÁN</Text>
          <Text style={styles.tileSubtitle}>Chi tiết Telemetry & Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuTile}
          onPress={() => navigation.navigate('MotorTest')}>
          <Text style={styles.tileIcon}>🔧</Text>
          <Text style={styles.tileTitle}>TEST MOTOR</Text>
          <Text style={styles.tileSubtitle}>Kiểm tra 4 động cơ độc lập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuTile}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.tileIcon}>⚙️</Text>
          <Text style={styles.tileTitle}>CÀI ĐẶT</Text>
          <Text style={styles.tileSubtitle}>Cấu hình kết nối & Tốc độ</Text>
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
    backgroundColor: '#0F0F12',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  topBar: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  primaryTile: {
    borderColor: '#00E676',
    backgroundColor: '#12251B',
  },
  tileIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  tileTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tileSubtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 3,
  },
  emergencySection: {
    marginTop: 20,
  },
});
