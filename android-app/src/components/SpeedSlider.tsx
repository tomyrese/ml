import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const PRESETS = [0.20, 0.35, 0.50, 0.75, 1.00];

export const SpeedSlider: React.FC<Props> = ({ currentSpeed, onSpeedChange, disabled = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>TỐC ĐỘ DI CHUYỂN</Text>
        <Text style={styles.speedValue}>{Math.round(currentSpeed * 100)}%</Text>
      </View>

      <View style={styles.presetsRow}>
        {PRESETS.map(spd => {
          const isSelected = Math.abs(currentSpeed - spd) < 0.02;
          return (
            <TouchableOpacity
              key={spd}
              style={[
                styles.presetChip,
                isSelected && styles.presetChipSelected,
                disabled && styles.disabledChip,
              ]}
              disabled={disabled}
              onPress={() => onSpeedChange(spd)}>
              <Text
                style={[
                  styles.presetText,
                  isSelected && styles.presetTextSelected,
                  disabled && styles.disabledText,
                ]}>
                {Math.round(spd * 100)}%
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
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#333333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  speedValue: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3E3E3E',
  },
  presetChipSelected: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  disabledChip: {
    opacity: 0.4,
  },
  presetText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '700',
  },
  presetTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  disabledText: {
    color: '#666666',
  },
});
