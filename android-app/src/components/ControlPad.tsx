import React, { useState } from 'react';
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
  const [activeDir, setActiveDir] = useState<string | null>(null);

  const handlePressIn = (dir: 'forward' | 'backward' | 'left' | 'right') => {
    setActiveDir(dir);
    onDirectionPress(dir);
  };

  const handlePressOut = () => {
    setActiveDir(null);
    onDirectionRelease();
  };

  return (
    <View style={styles.outerRing}>
      <View style={styles.padGrid}>
        <View style={styles.topRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.dirBtn,
              activeDir === 'forward' && styles.btnActive,
              disabled && styles.disabledBtn,
            ]}
            disabled={disabled}
            onPressIn={() => handlePressIn('forward')}
            onPressOut={handlePressOut}>
            <Text style={[styles.arrowIcon, activeDir === 'forward' && styles.arrowActive]}>▲</Text>
            <Text style={[styles.dirText, activeDir === 'forward' && styles.textActive]}>FORWARD</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.midRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.dirBtn,
              activeDir === 'left' && styles.btnActive,
              disabled && styles.disabledBtn,
            ]}
            disabled={disabled}
            onPressIn={() => handlePressIn('left')}
            onPressOut={handlePressOut}>
            <Text style={[styles.arrowIcon, activeDir === 'left' && styles.arrowActive]}>◀</Text>
            <Text style={[styles.dirText, activeDir === 'left' && styles.textActive]}>LEFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.stopBtn, disabled && styles.disabledBtn]}
            disabled={disabled}
            onPress={onStopPress}>
            <View style={styles.stopInner}>
              <Text style={styles.stopIcon}>■</Text>
              <Text style={styles.stopText}>STOP</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.dirBtn,
              activeDir === 'right' && styles.btnActive,
              disabled && styles.disabledBtn,
            ]}
            disabled={disabled}
            onPressIn={() => handlePressIn('right')}
            onPressOut={handlePressOut}>
            <Text style={[styles.arrowIcon, activeDir === 'right' && styles.arrowActive]}>▶</Text>
            <Text style={[styles.dirText, activeDir === 'right' && styles.textActive]}>RIGHT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.botRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.dirBtn,
              activeDir === 'backward' && styles.btnActive,
              disabled && styles.disabledBtn,
            ]}
            disabled={disabled}
            onPressIn={() => handlePressIn('backward')}
            onPressOut={handlePressOut}>
            <Text style={[styles.arrowIcon, activeDir === 'backward' && styles.arrowActive]}>▼</Text>
            <Text style={[styles.dirText, activeDir === 'backward' && styles.textActive]}>BACKWARD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerRing: {
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: '#14171F',
    borderWidth: 2,
    borderColor: '#242B38',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  padGrid: {
    width: 260,
    height: 260,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  topRow: {
    alignItems: 'center',
  },
  midRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 6,
  },
  botRow: {
    alignItems: 'center',
  },
  dirBtn: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: '#1B212D',
    borderWidth: 1.5,
    borderColor: '#2E384A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  btnActive: {
    backgroundColor: '#00E676',
    borderColor: '#B9F6CA',
    elevation: 8,
  },
  arrowIcon: {
    fontSize: 22,
    color: '#00E5FF',
    fontWeight: '900',
  },
  arrowActive: {
    color: '#000000',
  },
  dirText: {
    fontSize: 9,
    color: '#ECEFF1',
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  textActive: {
    color: '#000000',
  },
  stopBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#3E1017',
    borderWidth: 2,
    borderColor: '#FF1744',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  stopInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    fontSize: 18,
    color: '#FF1744',
    fontWeight: '900',
  },
  stopText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  disabledBtn: {
    opacity: 0.35,
  },
});
