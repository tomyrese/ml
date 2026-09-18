import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus } from '../types/robot';

interface Props {
  status: ConnectionStatus;
  robotName?: string;
}

export const ConnectionBadge: React.FC<Props> = ({ status, robotName = 'Pi Robot' }) => {
  let bgColor = '#141820';
  let borderColor = '#242B38';
  let dotColor = '#777777';
  let label = 'MẤT KẾT NỐI';

  if (status === 'CONNECTED') {
    bgColor = '#0A2518';
    borderColor = '#00E676';
    dotColor = '#00E676';
    label = 'ONLINE (LAN)';
  } else if (status === 'CONNECTING' || status === 'AUTHENTICATING' || status === 'RECONNECTING') {
    bgColor = '#251F0A';
    borderColor = '#FFB300';
    dotColor = '#FFB300';
    label = status === 'RECONNECTING' ? 'RECONNECTING...' : 'CONNECTING...';
  } else if (status === 'FAILED') {
    bgColor = '#250A0E';
    borderColor = '#FF1744';
    dotColor = '#FF1744';
    label = 'LỖI KẾT NỐI';
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: borderColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.robotName}>{robotName}</Text>
      <Text style={styles.divider}>•</Text>
      <Text style={[styles.label, { color: dotColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    elevation: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  robotName: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    color: '#546E7A',
    marginHorizontal: 6,
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
