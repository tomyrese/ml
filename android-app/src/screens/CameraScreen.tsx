import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRobotStore } from '../store/robotStore';
import { CameraPreview } from '../components/CameraPreview';
import { EmergencyButton } from '../components/EmergencyButton';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { RobotSocket } from '../services/RobotSocket';

export const CameraScreen: React.FC = () => {
  const { connectionStatus, pairedRobot, telemetry, personDetected, personConfidence } = useRobotStore();

  const handleEmergencyStop = () => {
    RobotSocket.getInstance().sendEmergencyStop();
  };

  const camFps = telemetry ? `${telemetry.cameraFps.toFixed(1)} FPS` : '0.0 FPS';
  const infFps = telemetry ? `${telemetry.inferenceFps.toFixed(1)} FPS` : '0.0 FPS';
  const confText = personDetected ? `${Math.round(personConfidence * 100)}%` : 'CLEAR';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <ConnectionBadge
          status={connectionStatus}
          robotName={pairedRobot?.robotName || 'RBT01'}
        />
        <View style={styles.fpsBadge}>
          <Text style={styles.fpsLabel}>LIVE FEED:</Text>
          <Text style={styles.fpsValue}>{camFps}</Text>
        </View>
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
        <View style={styles.cardHeader}>
          <Text style={styles.metaTitle}>VISION PIPELINE & AI STATUS</Text>
          <View style={[styles.aiPill, personDetected ? styles.aiPillAlert : styles.aiPillSafe]}>
            <Text style={styles.aiPillText}>
              {personDetected ? 'PERSON IN ZONE' : 'SAFETY CLEAR'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Camera Hardware:</Text>
          <Text style={styles.metaVal}>Raspberry Pi CSI (Picamera2)</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Capture Resolution:</Text>
          <Text style={styles.metaVal}>640x480 @ 30 FPS</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>AI Vision Model:</Text>
          <Text style={styles.metaVal}>SSD MobileNet V2 COCO INT8</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Inference Speed:</Text>
          <Text style={styles.metaVal}>{infFps}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Person Confidence:</Text>
          <Text style={[styles.metaVal, personDetected ? styles.confAlert : styles.confSafe]}>
            {confText}
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
  fpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141822',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242B38',
    gap: 6,
  },
  fpsLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '800',
  },
  fpsValue: {
    color: '#00E676',
    fontWeight: '900',
    fontSize: 12,
  },
  streamContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  noRobotBox: {
    height: 240,
    backgroundColor: '#141822',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#242B38',
  },
  noRobotText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
  },
  metaCard: {
    backgroundColor: '#141822',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#242B38',
    marginBottom: 14,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2535',
    paddingBottom: 8,
  },
  metaTitle: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  aiPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  aiPillSafe: {
    backgroundColor: '#0A2518',
    borderColor: '#00E676',
  },
  aiPillAlert: {
    backgroundColor: '#250A10',
    borderColor: '#FF1744',
  },
  aiPillText: {
    color: '#ECEFF1',
    fontSize: 9,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
  },
  metaVal: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '800',
  },
  confSafe: {
    color: '#00E676',
  },
  confAlert: {
    color: '#FF1744',
  },
  emergencyWrapper: {
    marginTop: 6,
  },
});
