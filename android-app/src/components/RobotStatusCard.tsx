import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TelemetryData } from '../types/protocol';

interface Props {
  telemetry: TelemetryData | null;
}

export const RobotStatusCard: React.FC<Props> = ({ telemetry }) => {
  const camFps = telemetry ? telemetry.cameraFps.toFixed(1) : '0.0';
  const infFps = telemetry ? telemetry.inferenceFps.toFixed(1) : '0.0';
  const cpuTempNum = telemetry?.cpuTemp || 0;
  const cpuTemp = telemetry?.cpuTemp ? `${telemetry.cpuTemp.toFixed(1)}°C` : '--';
  const cpuUsage = telemetry?.cpuUsage ? `${Math.round(telemetry.cpuUsage)}%` : '--';
  const ramUsage = telemetry?.memoryUsage ? `${Math.round(telemetry.memoryUsage)}%` : '--';

  const m1 = telemetry ? `${Math.round(telemetry.m1 * 100)}%` : '0%';
  const m2 = telemetry ? `${Math.round(telemetry.m2 * 100)}%` : '0%';
  const m3 = telemetry ? `${Math.round(telemetry.m3 * 100)}%` : '0%';
  const m4 = telemetry ? `${Math.round(telemetry.m4 * 100)}%` : '0%';

  const getTempColor = (t: number) => {
    if (t <= 0) return '#00E5FF';
    if (t < 55) return '#00E676';
    if (t < 70) return '#FFB300';
    return '#FF1744';
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>LIVE TELEMETRY HUD</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>STREAMING</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>CAM FPS</Text>
          <Text style={styles.value}>{camFps}</Text>
          <Text style={styles.unit}>CSI Target</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>AI FPS</Text>
          <Text style={styles.value}>{infFps}</Text>
          <Text style={styles.unit}>MobileNet SSD</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>CPU TEMP</Text>
          <Text style={[styles.value, { color: getTempColor(cpuTempNum) }]}>{cpuTemp}</Text>
          <Text style={styles.unit}>Pi 4 SoC</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>CPU LOAD</Text>
          <Text style={styles.value}>{cpuUsage}</Text>
          <Text style={styles.unit}>4 Cores A72</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>RAM USAGE</Text>
          <Text style={styles.value}>{ramUsage}</Text>
          <Text style={styles.unit}>System Memory</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>AI DETECT</Text>
          <Text
            style={[
              styles.value,
              telemetry?.personDetected ? styles.personAlert : styles.clearText,
            ]}>
            {telemetry?.personDetected ? 'DETECTED' : 'CLEAR'}
          </Text>
          <Text style={styles.unit}>Safety Stop Zone</Text>
        </View>
      </View>

      <View style={styles.motorSection}>
        <Text style={styles.motorTitle}>MOTOR DRIVER OUTPUTS (TB6612FNG)</Text>
        <View style={styles.motorGrid}>
          <View style={styles.motorTile}>
            <Text style={styles.motorLabel}>M1 (FRONT LEFT)</Text>
            <Text style={styles.motorVal}>{m1}</Text>
          </View>
          <View style={styles.motorTile}>
            <Text style={styles.motorLabel}>M3 (FRONT RIGHT)</Text>
            <Text style={styles.motorVal}>{m3}</Text>
          </View>
          <View style={styles.motorTile}>
            <Text style={styles.motorLabel}>M2 (REAR LEFT)</Text>
            <Text style={styles.motorVal}>{m2}</Text>
          </View>
          <View style={styles.motorTile}>
            <Text style={styles.motorLabel}>M4 (REAR RIGHT)</Text>
            <Text style={styles.motorVal}>{m4}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141820',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: '#242B38',
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2518',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00E676',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  liveText: {
    color: '#00E676',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '31.5%',
    backgroundColor: '#0E121A',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2533',
  },
  label: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  value: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  unit: {
    color: '#546E7A',
    fontSize: 8,
    marginTop: 1,
  },
  personAlert: {
    color: '#FF1744',
  },
  clearText: {
    color: '#00E676',
  },
  motorSection: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E2533',
    paddingTop: 8,
  },
  motorTitle: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  motorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  motorTile: {
    width: '48.5%',
    backgroundColor: '#0E121A',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2533',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motorLabel: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '700',
  },
  motorVal: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '900',
  },
});
