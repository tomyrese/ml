import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRobotStore, updateGlobalState } from '../store/robotStore';
import { RobotApi } from '../services/RobotApi';
import { RobotSocket } from '../services/RobotSocket';
import { StorageService } from '../services/StorageService';
import { RobotLogo } from '../components/RobotLogo';

interface Props {
  navigation: any;
}

export const PairScreen: React.FC<Props> = ({ navigation }) => {
  const { connectionStatus, pairedRobot } = useRobotStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('8765');
  const [pairCode, setPairCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    StorageService.getPairedRobot().then(robot => {
      if (robot) {
        updateGlobalState(() => ({ pairedRobot: robot }));
        setHost(robot.host);
        setPort(robot.port ? robot.port.toString() : '8765');
      }
    });
  }, []);

  const handleScanPress = () => {
    navigation.navigate('QrScanner');
  };

  const handleReconnect = async () => {
    setErrorMessage('');
    const target = pairedRobot || (await StorageService.getPairedRobot());
    if (target && target.host && target.token) {
      RobotSocket.getInstance().connect(target.host, target.port || 8765, target.token);
      navigation.navigate('Dashboard');
    } else {
      setErrorMessage('Chưa có thông tin robot đã ghép nối. Vui lòng quét mã QR trên OLED.');
    }
  };

  const handleManualPair = async () => {
    if (!host.trim() || !pairCode.trim()) {
      setErrorMessage('Vui lòng nhập IP và mã ghép nối.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const portNum = parseInt(port, 10) || 8765;
      const res = await RobotApi.pair(host.trim(), portNum, pairCode.trim().toUpperCase());

      if (res.success && res.token) {
        const info = {
          robotId: res.robotId,
          robotName: res.robotName,
          host: host.trim(),
          port: portNum,
          token: res.token,
          lastConnected: Date.now(),
        };

        await StorageService.savePairedRobot(info);
        updateGlobalState(() => ({ pairedRobot: info }));

        RobotSocket.getInstance().connect(host.trim(), portNum, res.token);
        setModalVisible(false);
        navigation.navigate('Dashboard');
      } else {
        setErrorMessage(res.message || 'Mã ghép nối không hợp lệ hoặc đã hết hạn.');
      }
    } catch (e: any) {
      setErrorMessage(`Không thể kết nối: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <RobotLogo size={80} />
        </View>
        <Text style={styles.appTitle}>PI ROBOT CONTROLLER</Text>
        <Text style={styles.subTitle}>Raspberry Pi 4 Autonomous Platform</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>HỆ THỐNG GHÉP NỐI AN TOÀN</Text>
          <View style={[
            styles.statusPill,
            connectionStatus === 'CONNECTED' ? styles.statusOnline : styles.statusOffline
          ]}>
            <Text style={styles.statusPillText}>{connectionStatus}</Text>
          </View>
        </View>

        {pairedRobot ? (
          <View style={styles.pairedInfo}>
            <Text style={styles.infoLabel}>Robot Đã Ghép Nối Trước Đó:</Text>
            <Text style={styles.infoValue}>
              {pairedRobot.robotName}
            </Text>
            <Text style={styles.infoIp}>
              {pairedRobot.host}:{pairedRobot.port}
            </Text>
          </View>
        ) : (
          <Text style={styles.emptyInfo}>
            Chưa ghép nối thiết bị. Hãy quét mã QR đang hiển thị trên màn hình OLED 1.3" của Robot.
          </Text>
        )}
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn} onPress={handleScanPress}>
          <Text style={styles.primaryBtnText}>📷 QUÉT MÃ QR TRÊN OLED</Text>
        </TouchableOpacity>

        {pairedRobot && (
          <TouchableOpacity activeOpacity={0.8} style={styles.secondaryBtn} onPress={handleReconnect}>
            <Text style={styles.secondaryBtnText}>🔄 KẾT NỐI LẠI NGAY</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.textBtn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.textBtnLabel}>Nhập IP & Mã Ghép Nối Thủ Công</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>GHÉP NỐI THỦ CÔNG</Text>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Text style={styles.inputLabel}>Địa Chỉ IPv4 Robot</Text>
            <TextInput
              style={styles.input}
              placeholder="192.168.1.50"
              placeholderTextColor="#666"
              value={host}
              onChangeText={setHost}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Cổng Server (Port)</Text>
            <TextInput
              style={styles.input}
              placeholder="8765"
              placeholderTextColor="#666"
              value={port}
              onChangeText={setPort}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Mã Ghép Nối (Pairing Code)</Text>
            <TextInput
              style={styles.input}
              placeholder="A7K39P"
              placeholderTextColor="#666"
              value={pairCode}
              onChangeText={setPairCode}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>HỦY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleManualPair}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.confirmBtnText}>KẾT NỐI</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A0D14',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoWrap: {
    marginBottom: 14,
  },
  appTitle: {
    color: '#00E5FF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subTitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#141822',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#242B3A',
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusOnline: {
    backgroundColor: '#0A2518',
    borderColor: '#00E676',
  },
  statusOffline: {
    backgroundColor: '#250A10',
    borderColor: '#FF1744',
  },
  statusPillText: {
    color: '#ECEFF1',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pairedInfo: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E2535',
    paddingTop: 12,
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  infoIp: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyInfo: {
    color: '#78909C',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    borderColor: '#FF1744',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FF5252',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#00E676',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: '#1E2535',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
  },
  secondaryBtnText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textBtnLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#141822',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#2E384D',
  },
  modalTitle: {
    color: '#00E5FF',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FF1744',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0A0D14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E384D',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#242B3A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FFF',
    fontWeight: '800',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#00E676',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000',
    fontWeight: '900',
  },
});
