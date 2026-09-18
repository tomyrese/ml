import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from 'react-native-vision-camera';
import { parsePairingPayload } from '../utils/pairingParser';
import { RobotApi } from '../services/RobotApi';
import { RobotSocket } from '../services/RobotSocket';
import { StorageService } from '../services/StorageService';
import { updateGlobalState } from '../store/robotStore';

interface Props {
  navigation: any;
}

export const QrScannerScreen: React.FC<Props> = ({ navigation }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleQrPayload = async (rawCode: string) => {
    if (scanned || loading) {
      return;
    }
    setScanned(true);

    const parsed = parsePairingPayload(rawCode);
    if (!parsed) {
      Alert.alert('Mã QR Không Hợp Lệ', 'Mã QR trên OLED robot phải có định dạng P1|HOST|PORT|CODE', [
        { text: 'Thử lại', onPress: () => setScanned(false) },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await RobotApi.pair(parsed.host, parsed.port, parsed.pairCode);

      if (res.success && res.token) {
        const info = {
          robotId: res.robotId,
          robotName: res.robotName,
          host: parsed.host,
          port: parsed.port,
          token: res.token,
          lastConnected: Date.now(),
        };

        await StorageService.savePairedRobot(info);
        updateGlobalState(() => ({ pairedRobot: info }));

        RobotSocket.getInstance().connect(parsed.host, parsed.port, res.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        Alert.alert('Ghép Nối Thất Bại', res.message || 'Mã ghép nối đã hết hạn hoặc không đúng.', [
          { text: 'Thử lại', onPress: () => setScanned(false) },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Lỗi Kết Nối', `Không thể kết nối đến robot: ${e.message}`, [
        { text: 'Thử lại', onPress: () => setScanned(false) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        handleQrPayload(codes[0].value);
      }
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Cần cấp quyền Camera để quét mã QR trên màn hình OLED.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>CẤP QUYỀN CAMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Không tìm thấy Camera sau trên thiết bị.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!scanned && !loading}
        codeScanner={codeScanner}
        torch={torch ? 'on' : 'off'}
      />

      <View style={styles.overlay}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setTorch(!torch)}>
            <Text style={styles.iconText}>{torch ? '🔦 TẮT ĐÈN' : '💡 BẬT ĐÈN'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scannerCenter}>
          <View style={styles.targetFrame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.instructionText}>Hướng camera vào mã QR trên màn hình OLED của Robot</Text>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00E676" />
            <Text style={styles.loadingText}>Đang xác thực ghép nối...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F0F12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#ECEFF1',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: '#00E676',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  permBtnText: {
    color: '#000',
    fontWeight: '800',
  },
  backBtn: {
    paddingVertical: 10,
  },
  backBtnText: {
    color: '#8E8E93',
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scannerCenter: {
    alignItems: 'center',
  },
  targetFrame: {
    width: 240,
    height: 240,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.4)',
    position: 'relative',
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00E676',
  },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  instructionText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
});
