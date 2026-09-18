import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRobotStore } from '../store/robotStore';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { SafetyBanner } from '../components/SafetyBanner';
import { SpeedSlider } from '../components/SpeedSlider';
import { ControlPad } from '../components/ControlPad';
import { EmergencyButton } from '../components/EmergencyButton';
import { CameraPreview } from '../components/CameraPreview';
import { RobotSocket } from '../services/RobotSocket';

interface Props {
  navigation: any;
}

export const ControlScreen: React.FC<Props> = ({ navigation }) => {
  const {
    connectionStatus,
    pairedRobot,
    settings,
    telemetry,
    robotState,
    safetyState,
    personDetected,
    personConfidence,
    isEmergencyStopped,
    isSafetyBlocked,
  } = useRobotStore();

  const [currentSpeed, setCurrentSpeed] = useState(settings.defaultSpeed || 0.35);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      RobotSocket.getInstance().stopDriveLoop();
    });
    return () => {
      RobotSocket.getInstance().stopDriveLoop();
      unsubscribe();
    };
  }, [navigation]);

  const handleDirectionPress = (direction: 'forward' | 'backward' | 'left' | 'right') => {
    RobotSocket.getInstance().startDriveLoop(direction, currentSpeed);
  };

  const handleDirectionRelease = () => {
    RobotSocket.getInstance().stopDriveLoop();
  };

  const handleStop = () => {
    RobotSocket.getInstance().sendStop();
  };

  const handleEmergencyStop = () => {
    RobotSocket.getInstance().sendEmergencyStop();
  };

  const handleResetEmergency = () => {
    Alert.alert(
      'Xác Nhận Mở Khóa An Toàn',
      'Bạn có chắc chắn khu vực xung quanh robot đã an toàn không có chướng ngại vật?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mở Khóa',
          onPress: () => {
            RobotSocket.getInstance().sendEmergencyReset();
          },
        },
      ]
    );
  };

  const handleSpeedChange = (spd: number) => {
    setCurrentSpeed(spd);
    RobotSocket.getInstance().updateDriveSpeed(spd);
  };

  const isControlDisabled =
    connectionStatus !== 'CONNECTED' || isSafetyBlocked || isEmergencyStopped;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <ConnectionBadge
          status={connectionStatus}
          robotName={pairedRobot?.robotName || 'RBT01'}
        />
        <View style={styles.statePill}>
          <Text style={styles.stateLabel}>MOTION:</Text>
          <Text style={styles.stateValue}>{robotState}</Text>
        </View>
      </View>

      <SafetyBanner
        robotState={robotState}
        safetyState={safetyState}
        personDetected={personDetected}
        personConfidence={personConfidence}
        connectionStatus={connectionStatus}
        isEmergencyStopped={isEmergencyStopped}
      />

      {settings.enableCameraPreview && pairedRobot && (
        <View style={styles.previewBox}>
          <CameraPreview
            host={pairedRobot.host}
            port={pairedRobot.port}
            token={pairedRobot.token}
            height={160}
            aspectRatio={16 / 9}
            fps={telemetry?.cameraFps || 0}
            personDetected={personDetected}
          />
        </View>
      )}

      <SpeedSlider
        currentSpeed={currentSpeed}
        onSpeedChange={handleSpeedChange}
        disabled={connectionStatus !== 'CONNECTED'}
      />

      <View style={styles.padWrapper}>
        <ControlPad
          onDirectionPress={handleDirectionPress}
          onDirectionRelease={handleDirectionRelease}
          onStopPress={handleStop}
          disabled={isControlDisabled}
        />
      </View>

      <View style={styles.bottomActions}>
        <EmergencyButton onPress={handleEmergencyStop} />

        {isEmergencyStopped && (
          <TouchableOpacity activeOpacity={0.8} style={styles.resetBtn} onPress={handleResetEmergency}>
            <Text style={styles.resetBtnText}>🔄 MỞ KHÓA E-STOP (RESET)</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141822',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242B38',
    gap: 6,
  },
  stateLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stateValue: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '900',
  },
  previewBox: {
    marginVertical: 4,
  },
  padWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    marginTop: 8,
    gap: 8,
  },
  resetBtn: {
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00E676',
    elevation: 4,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
