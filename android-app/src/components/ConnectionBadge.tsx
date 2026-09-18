import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus } from '../types/robot';

interface Props {
  status: ConnectionStatus;
  robotName?: string;
}

export const ConnectionBadge: React.FC<Props> = ({ status, robotName = 'Pi Robot' }) => {
  let bgColor = '#333333';
  let dotColor = '#777777';
  let label = 'MẤT KẾT NỐI';

  if (status === 'CONNECTED') {
    bgColor = '#112918';
    dotColor = '#00E676';
    label = 'ĐÃ KẾT NỐI';
  } else if (status === 'CONNECTING' || status === 'AUTHENTICATING' || status === 'RECONNECTING') {
    bgColor = '#332900';
    dotColor = '#FFD600';
    label = status === 'RECONNECTING' ? 'ĐANG KẾT NỐI LẠI...' : 'ĐANG KẾT NỐI...';
  } else if (status === 'FAILED') {
    bgColor = '#331111';
    dotColor = '#FF1744';
    label = 'LỖI KẾT NỐI';
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.robotName}>{robotName}</Text>
      <Text style={styles.divider}>|</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  robotName: {
    color: '#EEEEEE',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    color: '#666666',
    marginHorizontal: 8,
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
