import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export const EmergencyButton: React.FC<Props> = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.hazardHeader}>
        <View style={styles.hazardBar} />
        <Text style={styles.hazardText}>CRITICAL SAFETY INTERRUPT</Text>
        <View style={styles.hazardBar} />
      </View>
      <View style={styles.innerGlow}>
        <Text style={styles.buttonText}>EMERGENCY STOP</Text>
        <Text style={styles.subText}>CUT POWER AND INSTANT BRAKE</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#B71C1C',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF1744',
    elevation: 8,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    marginVertical: 6,
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  hazardBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 205, 210, 0.4)',
  },
  hazardText: {
    color: '#FFCDD2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  innerGlow: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subText: {
    color: '#FFCDD2',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.4,
  },
});
