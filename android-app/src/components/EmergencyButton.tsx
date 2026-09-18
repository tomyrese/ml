import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export const EmergencyButton: React.FC<Props> = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.innerGlow}>
        <Text style={styles.buttonText}>🛑 DỪNG KHẨN CẤP</Text>
        <Text style={styles.subText}>EMERGENCY STOP</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D50000',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF1744',
    elevation: 8,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    marginVertical: 6,
  },
  innerGlow: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subText: {
    color: '#FFCDD2',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
