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
          robotName={pairedRobot?.robotName || 'Pi Robot'}
        />
        <Text style={styles.motionStateText}>TRẠNG THÁI: {robotState}</Text>
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
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetEmergency}>
            <Text style={styles.resetBtnText}>🔄 RESET EMERGENCY STOP</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
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
  motionStateText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
  },
  previewBox: {
    marginVertical: 4,
  },
  padWrapper: {
    marginVertical: 8,
    alignItems: 'center',
  },
  bottomActions: {
    marginTop: 8,
    gap: 8,
  },
  resetBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
