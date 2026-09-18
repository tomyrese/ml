import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PairScreen } from '../screens/PairScreen';
import { QrScannerScreen } from '../screens/QrScannerScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ControlScreen } from '../screens/ControlScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { MotorTestScreen } from '../screens/MotorTestScreen';
import { DiagnosticsScreen } from '../screens/DiagnosticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Pair: undefined;
  QrScanner: undefined;
  Dashboard: undefined;
  Control: undefined;
  Camera: undefined;
  MotorTest: undefined;
  Diagnostics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Pair"
      screenOptions={{
        headerStyle: { backgroundColor: '#1C1C1E' },
        headerTintColor: '#00E676',
        headerTitleStyle: { fontWeight: '800', fontSize: 16 },
        contentStyle: { backgroundColor: '#0F0F12' },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Pair"
        component={PairScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QrScanner"
        component={QrScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'BẢNG ĐIỀU KHIỂN ROBOT' }}
      />
      <Stack.Screen
        name="Control"
        component={ControlScreen}
        options={{ title: 'ĐIỀU KHIỂN ROBOT' }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'CAMERA CSI TRỰC TIẾP' }}
      />
      <Stack.Screen
        name="MotorTest"
        component={MotorTestScreen}
        options={{ title: 'KIỂM TRA ĐỘNG CƠ' }}
      />
      <Stack.Screen
        name="Diagnostics"
        component={DiagnosticsScreen}
        options={{ title: 'CHẨN ĐOÁN HỆ THỐNG' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'CÀI ĐẶT' }}
      />
    </Stack.Navigator>
  );
};
