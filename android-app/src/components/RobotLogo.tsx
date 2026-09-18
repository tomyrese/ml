import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface Props {
  size?: number;
}

export const RobotLogo: React.FC<Props> = ({ size = 64 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E5FF" />
            <Stop offset="100%" stopColor="#00E676" />
          </LinearGradient>
          <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1A2130" />
            <Stop offset="100%" stopColor="#0E131F" />
          </LinearGradient>
          <LinearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#00E5FF" />
            <Stop offset="100%" stopColor="#00E676" />
          </LinearGradient>
        </Defs>

        <Path
          d="M50 6 L88 24 L88 76 L50 94 L12 76 L12 24 Z"
          fill="url(#shieldGrad)"
          stroke="url(#logoGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <G>
          <Path
            d="M50 14 L50 24"
            stroke="#00E5FF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Circle cx="50" cy="14" r="3.5" fill="#00E676" />
        </G>

        <Rect
          x="26"
          y="28"
          width="48"
          height="34"
          rx="8"
          fill="#121824"
          stroke="#00E5FF"
          strokeWidth="2"
        />

        <Rect
          x="32"
          y="38"
          width="36"
          height="14"
          rx="5"
          fill="url(#eyeGrad)"
        />

        <Circle cx="40" cy="45" r="3" fill="#0E131F" />
        <Circle cx="60" cy="45" r="3" fill="#0E131F" />

        <Path
          d="M34 68 L66 68"
          stroke="#00E676"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M40 74 L60 74"
          stroke="#00E676"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <Path
          d="M45 80 L55 80"
          stroke="#00E676"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
