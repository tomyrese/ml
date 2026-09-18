import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeStore } from './src/store/robotStore';
import { AppLifecycleService } from './src/services/AppLifecycleService';

const App = () => {
  useEffect(() => {
    initializeStore();
    AppLifecycleService.init();

    return () => {
      AppLifecycleService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F12" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
