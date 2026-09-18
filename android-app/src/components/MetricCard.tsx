import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  value: string;
  unit?: string;
  statusColor?: string;
  icon?: string;
}

export const MetricCard: React.FC<Props> = ({
  title,
  value,
  unit,
  statusColor = '#00E676',
  icon,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  title: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
  unit: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
});
