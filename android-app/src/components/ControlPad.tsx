import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onDirectionPress: (direction: 'forward' | 'backward' | 'left' | 'right') => void;
  onDirectionRelease: () => void;
  onStopPress: () => void;
  disabled?: boolean;
}

export const ControlPad: React.FC<Props> = ({
  onDirectionPress,
  onDirectionRelease,
  onStopPress,
  disabled = false,
}) => {
  return (
    <View style={styles.padContainer}>
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.btn, styles.dirBtn, disabled && styles.disabledBtn]}
          disabled={disabled}
          onPressIn={() => onDirectionPress('forward')}
          onPressOut={onDirectionRelease}>
          <Text style={styles.arrowText}>▲</Text>
          <Text style={styles.dirLabel}>TIẾN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.middleRow}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.btn, styles.dirBtn, disabled && styles.disabledBtn]}
          disabled={disabled}
          onPressIn={() => onDirectionPress('left')}
          onPressOut={onDirectionRelease}>
          <Text style={styles.arrowText}>◀</Text>
          <Text style={styles.dirLabel}>TRÁI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.btn, styles.stopCenterBtn, disabled && styles.disabledBtn]}
          disabled={disabled}
          onPress={onStopPress}>
          <Text style={styles.stopText}>■</Text>
          <Text style={styles.stopLabel}>STOP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.btn, styles.dirBtn, disabled && styles.disabledBtn]}
          disabled={disabled}
          onPressIn={() => onDirectionPress('right')}
          onPressOut={onDirectionRelease}>
          <Text style={styles.arrowText}>▶</Text>
          <Text style={styles.dirLabel}>PHẢI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[styles.btn, styles.dirBtn, disabled && styles.disabledBtn]}
          disabled={disabled}
          onPressIn={() => onDirectionPress('backward')}
          onPressOut={onDirectionRelease}>
          <Text style={styles.arrowText}>▼</Text>
          <Text style={styles.dirLabel}>LÙI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  padContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  btn: {
    width: 84,
    height: 84,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1.5,
  },
  dirBtn: {
    backgroundColor: '#263238',
    borderColor: '#455A64',
    marginHorizontal: 8,
  },
  stopCenterBtn: {
    backgroundColor: '#B71C1C',
    borderColor: '#FF1744',
    marginHorizontal: 8,
  },
  disabledBtn: {
    opacity: 0.35,
  },
  arrowText: {
    color: '#00E676',
    fontSize: 26,
    fontWeight: '900',
  },
  dirLabel: {
    color: '#ECEFF1',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  stopText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  stopLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
});
