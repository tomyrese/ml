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
        <Text style={styles.robotLogo}>🤖</Text>
        <Text style={styles.appTitle}>PI ROBOT CONTROLLER</Text>
        <Text style={styles.subTitle}>Hệ Thống Điều Khiển Robot Tự Hành</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TRẠNG THÁI KẾT NỐI</Text>
        <Text style={styles.statusText}>{connectionStatus}</Text>

        {pairedRobot && (
          <View style={styles.pairedInfo}>
            <Text style={styles.infoLabel}>Robot Đã Ghép Nối:</Text>
            <Text style={styles.infoValue}>
              {pairedRobot.robotName} ({pairedRobot.host}:{pairedRobot.port})
            </Text>
          </View>
        )}
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleScanPress}>
          <Text style={styles.primaryBtnText}>📷 QUÉT MÃ QR TRÊN OLED</Text>
        </TouchableOpacity>

        {pairedRobot && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleReconnect}>
            <Text style={styles.secondaryBtnText}>🔄 KẾT NỐI LẠI</Text>
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
    backgroundColor: '#0F0F12',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  robotLogo: {
    fontSize: 54,
    marginBottom: 8,
  },
  appTitle: {
    color: '#00E676',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subTitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusText: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  pairedInfo: {
    marginTop: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 10,
    width: '100%',
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    borderColor: '#FF1744',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FF5252',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#00E676',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  secondaryBtnText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '800',
  },
  textBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  textBtnLabel: {
    color: '#8E8E93',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  modalTitle: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF1744',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#121214',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#00E676',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000',
    fontWeight: '800',
  },
});
