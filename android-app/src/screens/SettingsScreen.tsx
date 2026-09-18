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
import { RobotLogo } from '../components/RobotLogo';

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
      'Bạn có chắc chắn muốn xóa thông tin robot này và đăng xuất khỏi hệ thống điều khiển?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hủy Ghép Nối',
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
      <View style={styles.logoHeader}>
        <RobotLogo size={52} />
        <Text style={styles.settingsTitle}>CẤU HÌNH THIẾT BỊ</Text>
        <Text style={styles.settingsSub}>Pi Robot System Preferences</Text>
      </View>

      <Text style={styles.sectionHeader}>CẤU HÌNH ĐIỀU KHIỂN & TỐC ĐỘ</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Tốc Độ Khởi Đầu Mặc Định</Text>
        <View style={styles.speedRow}>
          {[0.2, 0.35, 0.5, 0.75].map(spd => {
            const isSelected = Math.abs(settings.defaultSpeed - spd) < 0.02;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
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
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchLabel}>Mini Camera Preview</Text>
            <Text style={styles.switchSub}>Hiển thị video CSI thu nhỏ trên màn hình điều khiển</Text>
          </View>
          <Switch
            value={settings.enableCameraPreview}
            onValueChange={handleToggleCameraPreview}
            thumbColor={settings.enableCameraPreview ? '#00E676' : '#888'}
            trackColor={{ false: '#242B38', true: '#0A3B22' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchLabel}>Tự Động Kết Nối Lại</Text>
            <Text style={styles.switchSub}>Tự reconnect khi mất sóng Wi-Fi tạm thời</Text>
          </View>
          <Switch
            value={settings.autoReconnect}
            onValueChange={handleToggleAutoReconnect}
            thumbColor={settings.autoReconnect ? '#00E676' : '#888'}
            trackColor={{ false: '#242B38', true: '#0A3B22' }}
          />
        </View>
      </View>

      <Text style={styles.sectionHeader}>ROBOT ĐANG KẾT NỐI</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Tên Robot:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.robotName || 'Chưa ghép nối'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Robot ID:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.robotId || 'RBT01'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Địa Chỉ IP Server:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.host || '--'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Cổng Port:</Text>
          <Text style={styles.infoVal}>{pairedRobot?.port || 8765}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.forgetBtn} onPress={handleForgetRobot}>
          <Text style={styles.forgetBtnText}>🗑️ HỦY GHÉP NỐI & XÓA TOKEN</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>THÔNG TIN ỨNG DỤNG</Text>
      <View style={styles.card}>
        <Text style={styles.aboutText}>Pi Robot Controller v1.0.0 (Phase 2)</Text>
        <Text style={styles.aboutSub}>Framework: React Native CLI 0.76 (Android Native)</Text>
        <Text style={styles.aboutSub}>Protocol: P1 WebSocket Realtime (350ms Lease)</Text>
        <Text style={styles.aboutSub}>Vision: MobileNet SSD INT8 + CSI Camera Picamera2</Text>
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
  logoHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  settingsTitle: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
  },
  settingsSub: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#141822',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#242B38',
    elevation: 3,
  },
  cardLabel: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    flex: 1,
    backgroundColor: '#0E121A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242B38',
  },
  chipSelected: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  chipText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2535',
    marginVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    color: '#ECEFF1',
    fontSize: 13,
    fontWeight: '800',
  },
  switchSub: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  infoVal: {
    color: '#ECEFF1',
    fontSize: 12,
    fontWeight: '800',
  },
  forgetBtn: {
    backgroundColor: '#26080D',
    borderColor: '#FF1744',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  forgetBtnText: {
    color: '#FF1744',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  aboutText: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  aboutSub: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
});
