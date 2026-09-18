import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const PRESETS = [
  { value: 0.20, label: 'ECO', percent: '20%' },
  { value: 0.35, label: 'STD', percent: '35%' },
  { value: 0.50, label: 'MID', percent: '50%' },
  { value: 0.75, label: 'PWR', percent: '75%' },
  { value: 1.00, label: 'MAX', percent: '100%' },
];

export const SpeedSlider: React.FC<Props> = ({ currentSpeed, onSpeedChange, disabled = false }) => {
  const activePercent = Math.round(currentSpeed * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.label}>THROTTLE CONTROL</Text>
          <Text style={styles.subLabel}>Mức Tốc Độ Động Cơ</Text>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.speedValue}>{activePercent}%</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${activePercent}%` }]} />
      </View>

      <View style={styles.presetsRow}>
        {PRESETS.map(item => {
          const isSelected = Math.abs(currentSpeed - item.value) < 0.02;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.presetChip,
                isSelected && styles.presetChipSelected,
                disabled && styles.disabledChip,
              ]}
              disabled={disabled}
              onPress={() => onSpeedChange(item.value)}>
              <Text
                style={[
                  styles.chipLabel,
                  isSelected && styles.chipLabelSelected,
                ]}>
                {item.label}
              </Text>
              <Text
                style={[
                  styles.presetText,
                  isSelected && styles.presetTextSelected,
                ]}>
                {item.percent}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161A22',
    padding: 14,
    borderRadius: 16,
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
  titleWrap: {
    flex: 1,
  },
  label: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subLabel: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
  },
  badgeWrap: {
    backgroundColor: '#0A2E20',
    borderWidth: 1,
    borderColor: '#00E676',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  speedValue: {
    color: '#00E676',
    fontSize: 15,
    fontWeight: '900',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1C2330',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E676',
    borderRadius: 3,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#1E2533',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D374A',
  },
  presetChipSelected: {
    backgroundColor: '#00E676',
    borderColor: '#B9F6CA',
    elevation: 4,
  },
  disabledChip: {
    opacity: 0.35,
  },
  chipLabel: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '800',
  },
  chipLabelSelected: {
    color: '#004D40',
    fontWeight: '900',
  },
  presetText: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  presetTextSelected: {
    color: '#000000',
    fontWeight: '900',
  },
});
