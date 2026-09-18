import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRobotStore, updateGlobalState } from '../store/robotStore';
import { StorageService } from '../services/StorageService';
import { RobotApi } from '../services/RobotApi';
import { RobotSocket } from '../services/RobotSocket';

interface Props {
  navigation: any;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings, pairedRobot } = useRobotStore();

  const handleToggleCameraPreview = async (val: boolean) => {
    await StorageService.saveSettings({ enableCameraPreview: val });
    updateGlobalState(prev => ({
      settings: { ...prev.settings, enableCameraPreview: val },
    }));
  };

  const handleToggleAutoReconnect = async (val: boolean) => {
    await StorageService.saveSettings({ autoReconnect: val });
    updateGlobalState(prev => ({
      settings: { ...prev.settings, autoReconnect: val },
    }));
  };

  const handleSelectDefaultSpeed = async (speed: number) => {
    await StorageService.saveSettings({ defaultSpeed: speed });
    updateGlobalState(prev => ({
      settings: { ...prev.settings, defaultSpeed: speed },
    }));
  };

  const handleForgetRobot = () => {
    Alert.alert(
      'Xác Nhận Hủy Ghép Nối',
      'Bạn có chắc chắn muốn quên thông tin robot này và đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Quên Robot',
          style: 'destructive',
          onPress: async () => {
            if (pairedRobot) {
              await RobotApi.revokeSession(
                pairedRobot.host,
                pairedRobot.port,
                pairedRobot.token
              );
            }
            RobotSocket.getInstance().disconnect();
            await StorageService.clearPairedRobot();
            updateGlobalState(() => ({
              pairedRobot: null,
              connectionStatus: 'DISCONNECTED',
            }));
            navigation.reset({
              index: 0,
              routes: [{ name: 'Pair' }],
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeader}>CẤU HÌNH ĐIỀU KHIỂN</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Tốc Độ Mặc Định</Text>
        <View style={styles.speedRow}>
          {[0.2, 0.35, 0.5, 0.75].map(spd => {
            const isSelected = Math.abs(settings.defaultSpeed - spd) < 0.02;
            return (
              <TouchableOpacity
                key={spd}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => handleSelectDefaultSpeed(spd)}>
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {Math.round(spd * 100)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Hiển Thị Camera Preview Mini</Text>
          <Switch
            value={settings.enableCameraPreview}
            onValueChange={handleToggleCameraPreview}
            thumbColor={settings.enableCameraPreview ? '#00E676' : '#888'}
            trackColor={{ false: '#333', true: '#1B5E20' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Tự Động Kết Nối Lại Khi Mất Sóng</Text>
          <Switch
            value={settings.autoReconnect}
            onValueChange={handleToggleAutoReconnect}
            thumbColor={settings.autoReconnect ? '#00E676' : '#888'}
            trackColor={{ false: '#333', true: '#1B5E20' }}
          />
        </View>
      </View>

      <Text style={styles.sectionHeader}>ROBOT HIỆN TẠI</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Tên Robot:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.robotName || 'Chưa ghép nối'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Địa Chỉ IP:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.host || '--'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Cổng Port:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.port || 8765}</Text>
        </View>

        <TouchableOpacity style={styles.forgetBtn} onPress={handleForgetRobot}>
          <Text style={styles.forgetBtnText}>🗑️ HỦY GHÉP NỐI VỚI ROBOT</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>THÔNG TIN ỨNG DỤNG</Text>
      <View style={styles.card}>
        <Text style={styles.aboutText}>Pi Robot Controller v1.0.0 (Phase 2)</Text>
        <Text style={styles.aboutSub}>Framework: React Native CLI (Android)</Text>
        <Text style={styles.aboutSub}>Protocol: P1 WebSocket + FastAPI REST</Text>
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
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardLabel: {
    color: '#ECEFF1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3E3E3E',
  },
  chipSelected: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  chipText: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#ECEFF1',
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    color: '#8E8E93',
    fontSize: 12,
  },
  infoVal: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '700',
  },
  forgetBtn: {
    backgroundColor: '#3E1414',
    borderColor: '#FF1744',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  forgetBtnText: {
    color: '#FF1744',
    fontWeight: '800',
    fontSize: 13,
  },
  aboutText: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '800',
  },
  aboutSub: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 3,
  },
});
