import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TelemetryData } from '../types/protocol';

interface Props {
  telemetry: TelemetryData | null;
}

export const RobotStatusCard: React.FC<Props> = ({ telemetry }) => {
  const camFps = telemetry ? telemetry.cameraFps.toFixed(1) : '0.0';
  const infFps = telemetry ? telemetry.inferenceFps.toFixed(1) : '0.0';
  const cpuTemp = telemetry?.cpuTemp ? `${telemetry.cpuTemp.toFixed(1)}°C` : '--';
  const cpuUsage = telemetry?.cpuUsage ? `${Math.round(telemetry.cpuUsage)}%` : '--';
  const ramUsage = telemetry?.memoryUsage ? `${Math.round(telemetry.memoryUsage)}%` : '--';

  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>THÔNG SỐ THỜI GIAN THỰC (TELEMETRY)</Text>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>CAM FPS</Text>
          <Text style={styles.value}>{camFps}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>AI FPS</Text>
          <Text style={styles.value}>{infFps}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>CPU TEMP</Text>
          <Text style={styles.value}>{cpuTemp}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>CPU LOAD</Text>
          <Text style={styles.value}>{cpuUsage}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>RAM</Text>
          <Text style={styles.value}>{ramUsage}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>AI DETECT</Text>
          <Text
            style={[
              styles.value,
              telemetry?.personDetected ? styles.personAlert : styles.clearText,
            ]}>
            {telemetry?.personDetected ? 'NGƯỜI' : 'TRỐNG'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '31%',
    backgroundColor: '#121214',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222226',
  },
  label: {
    color: '#636366',
    fontSize: 10,
    fontWeight: '700',
  },
  value: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  personAlert: {
    color: '#FF1744',
  },
  clearText: {
    color: '#00E676',
  },
});
