import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRobotStore } from '../store/robotStore';
import { RobotApi } from '../services/RobotApi';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { MetricCard } from '../components/MetricCard';
import { formatUptime, formatFps } from '../utils/validation';

export const DiagnosticsScreen: React.FC = () => {
  const { connectionStatus, pairedRobot, telemetry, logs, robotState, safetyState } =
    useRobotStore();
  const [serverLogs, setServerLogs] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchLogs() {
      if (pairedRobot && connectionStatus === 'CONNECTED') {
        const remoteLogs = await RobotApi.getRecentLogs(
          pairedRobot.host,
          pairedRobot.port,
          pairedRobot.token
        );
        if (mounted && remoteLogs.length > 0) {
          setServerLogs(remoteLogs);
        }
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pairedRobot, connectionStatus]);

  const displayLogs = serverLogs.length > 0 ? serverLogs : logs;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <ConnectionBadge
          status={connectionStatus}
          robotName={pairedRobot?.robotName || 'RBT01'}
        />
        <View style={styles.uptimeBadge}>
          <Text style={styles.uptimeLabel}>UPTIME:</Text>
          <Text style={styles.uptimeVal}>{formatUptime(telemetry?.uptime)}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>SAFETY SYSTEM STATUS</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          title="ROBOT STATE"
          value={robotState}
          statusColor={robotState === 'SAFETY_STOP' || robotState === 'CAMERA_ERROR' ? '#FF1744' : '#00E676'}
        />
        <MetricCard
          title="SAFETY LOCK"
          value={safetyState}
          statusColor={safetyState !== 'CLEAR' ? '#FF9100' : '#00E676'}
        />
      </View>

      <Text style={styles.sectionHeader}>HARDWARE & THERMAL TELEMETRY</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          title="CPU TEMP"
          value={telemetry?.cpuTemp ? telemetry.cpuTemp.toFixed(1) : '--'}
          unit="°C"
          statusColor={telemetry?.cpuTemp && telemetry.cpuTemp > 70 ? '#FF1744' : '#00E676'}
        />
        <MetricCard
          title="CPU LOAD"
          value={telemetry?.cpuUsage ? Math.round(telemetry.cpuUsage).toString() : '--'}
          unit="%"
        />
        <MetricCard
          title="RAM USAGE"
          value={telemetry?.memoryUsage ? Math.round(telemetry.memoryUsage).toString() : '--'}
          unit="%"
        />
      </View>

      <Text style={styles.sectionHeader}>CSI VISION & AI DETECTION</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          title="CAMERA FPS"
          value={formatFps(telemetry?.cameraFps)}
          unit="fps"
        />
        <MetricCard
          title="AI INFERENCE"
          value={formatFps(telemetry?.inferenceFps)}
          unit="fps"
        />
        <MetricCard
          title="SAFETY ZONE"
          value={telemetry?.personDetected ? 'DETECTED' : 'CLEAR'}
          statusColor={telemetry?.personDetected ? '#FF1744' : '#00E676'}
        />
      </View>

      <Text style={styles.sectionHeader}>MOTOR POWER OUTPUTS (TB6612FNG)</Text>
      <View style={styles.metricsRow}>
        <MetricCard title="M1 (L-FWD)" value={`${Math.round((telemetry?.m1 || 0) * 100)}%`} />
        <MetricCard title="M2 (L-REV)" value={`${Math.round((telemetry?.m2 || 0) * 100)}%`} />
        <MetricCard title="M3 (R-FWD)" value={`${Math.round((telemetry?.m3 || 0) * 100)}%`} />
        <MetricCard title="M4 (R-REV)" value={`${Math.round((telemetry?.m4 || 0) * 100)}%`} />
      </View>

      <Text style={styles.sectionHeader}>NETWORK & SYSTEM METADATA</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Robot ID / Name:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.robotName || 'Pi Robot'} ({pairedRobot?.robotId || 'RBT01'})</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Server LAN IP:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.host || '--'}:{pairedRobot?.port || 8765}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Control Protocol:</Text>
          <Text style={styles.infoVal}>P1 WebSocket (350ms Lease)</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>SYSTEM EVENT LOGS</Text>
      <View style={styles.logBox}>
        {displayLogs.length === 0 ? (
          <Text style={styles.emptyLog}>No recent log entries</Text>
        ) : (
          displayLogs.map((item, idx) => (
            <Text key={idx} style={styles.logLine}>
              {item}
            </Text>
          ))
        )}
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
    marginBottom: 8,
  },
  uptimeBadge: {
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
  uptimeLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '800',
  },
  uptimeVal: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
  },
  sectionHeader: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  infoCard: {
    backgroundColor: '#141822',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#242B38',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  infoVal: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '800',
  },
  logBox: {
    backgroundColor: '#0E121A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#1E2535',
    maxHeight: 220,
  },
  logLine: {
    color: '#00E676',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
  emptyLog: {
    color: '#666',
    fontSize: 12,
  },
});
