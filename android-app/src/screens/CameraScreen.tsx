import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRobotStore } from '../store/robotStore';
import { CameraPreview } from '../components/CameraPreview';
import { EmergencyButton } from '../components/EmergencyButton';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { RobotSocket } from '../services/RobotSocket';

export const CameraScreen: React.FC = () => {
  const { connectionStatus, pairedRobot, telemetry, personDetected } = useRobotStore();

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
        <Text style={styles.fpsText}>
          {telemetry ? `${telemetry.cameraFps.toFixed(1)} FPS` : '0.0 FPS'}
        </Text>
      </View>

      {pairedRobot ? (
        <View style={styles.streamContainer}>
          <CameraPreview
            host={pairedRobot.host}
            port={pairedRobot.port}
            token={pairedRobot.token}
            height={280}
            aspectRatio={4 / 3}
            fps={telemetry?.cameraFps || 0}
            personDetected={personDetected}
          />
        </View>
      ) : (
        <View style={styles.noRobotBox}>
          <Text style={styles.noRobotText}>Chưa có thông tin kết nối Robot.</Text>
        </View>
      )}

      <View style={styles.metaCard}>
        <Text style={styles.metaTitle}>THÔNG TIN LUỒNG THỊ GIÁC CSI</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Camera Backend:</Text>
          <Text style={styles.metaVal}>Picamera2 / libcamera (Pi 4)</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>AI Person Detector:</Text>
          <Text style={styles.metaVal}>SSD MobileNet V2 Quantized</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>AI Inference Speed:</Text>
          <Text style={styles.metaVal}>
            {telemetry ? `${telemetry.inferenceFps.toFixed(1)} FPS` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.emergencyWrapper}>
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
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fpsText: {
    color: '#00E676',
    fontWeight: '800',
    fontSize: 14,
  },
  streamContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  noRobotBox: {
    height: 240,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noRobotText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  metaCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 16,
  },
  metaTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaLabel: {
    color: '#ECEFF1',
    fontSize: 12,
  },
  metaVal: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
  },
  emergencyWrapper: {
    marginTop: 8,
  },
});
