import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
          robotName={pairedRobot?.robotName || 'Pi Robot'}
        />
      </View>

      <Text style={styles.sectionHeader}>TRẠNG THÁI HỆ THỐNG</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          title="ROBOT STATE"
          value={robotState}
          statusColor={robotState === 'SAFETY_STOP' || robotState === 'CAMERA_ERROR' ? '#FF1744' : '#00E676'}
        />
        <MetricCard
          title="SAFETY STATE"
          value={safetyState}
          statusColor={safetyState !== 'CLEAR' ? '#FF9100' : '#00E676'}
        />
      </View>

      <Text style={styles.sectionHeader}>HIỆU NĂNG PHẦN CỨNG PI 4</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          title="CPU TEMP"
          value={telemetry?.cpuTemp ? telemetry.cpuTemp.toFixed(1) : '--'}
          unit="°C"
          statusColor={telemetry?.cpuTemp && telemetry.cpuTemp > 70 ? '#FF1744' : '#00E676'}
        />
        <MetricCard
          title="CPU USAGE"
          value={telemetry?.cpuUsage ? Math.round(telemetry.cpuUsage).toString() : '--'}
          unit="%"
        />
        <MetricCard
          title="RAM USAGE"
          value={telemetry?.memoryUsage ? Math.round(telemetry.memoryUsage).toString() : '--'}
          unit="%"
        />
      </View>

      <Text style={styles.sectionHeader}>THỊ GIÁC & AI</Text>
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
          title="NGƯỜI"
          value={telemetry?.personDetected ? 'PHÁT HIỆN' : 'TRỐNG'}
          statusColor={telemetry?.personDetected ? '#FF1744' : '#00E676'}
        />
      </View>

      <Text style={styles.sectionHeader}>OUTPUT 4 ĐỘNG CƠ</Text>
      <View style={styles.metricsRow}>
        <MetricCard title="M1 (L-FWD)" value={`${Math.round((telemetry?.m1 || 0) * 100)}%`} />
        <MetricCard title="M2 (L-REV)" value={`${Math.round((telemetry?.m2 || 0) * 100)}%`} />
        <MetricCard title="M3 (R-FWD)" value={`${Math.round((telemetry?.m3 || 0) * 100)}%`} />
        <MetricCard title="M4 (R-REV)" value={`${Math.round((telemetry?.m4 || 0) * 100)}%`} />
      </View>

      <Text style={styles.sectionHeader}>THÔNG TIN MẠNG & UPTIME</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Robot ID / Tên:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.robotName || 'Pi Robot'} ({pairedRobot?.robotId || 'RBT01'})</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>IP Server LAN:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.host || '--'}:{pairedRobot?.port || 8765}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Thời gian chạy (Uptime):</Text>
          <Text style={styles.infoVal}>{formatUptime(telemetry?.uptime)}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>LOGS HỆ THỐNG GẦN ĐÂY</Text>
      <View style={styles.logBox}>
        {displayLogs.length === 0 ? (
          <Text style={styles.emptyLog}>Chưa có log mới</Text>
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
    backgroundColor: '#0F0F12',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  topBar: {
    marginBottom: 8,
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  infoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    color: '#8E8E93',
    fontSize: 12,
  },
  infoVal: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '700',
  },
  logBox: {
    backgroundColor: '#121214',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    maxHeight: 200,
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
