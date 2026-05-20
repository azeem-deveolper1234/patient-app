import React, { useEffect } from 'react';
import { ActivityIndicator, View, LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';

export const navigationRef = createNavigationContainerRef<any>();
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PatientPortalRoot from './src/screens/PatientPortalRoot';
import type { AuthStackParamList, AppStackParamList } from './src/navigation/types';
import { STRINGS } from './src/constants/app';
import { colors } from './src/theme/colors';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.slate50 },
        headerTintColor: colors.slate800,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: STRINGS.nav.registerHeader }}
      />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Patient" component={PatientPortalRoot} />
    </AppStack.Navigator>
  );
}

function Root() {
  const { token, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.slate50,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }
  return token ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  useEffect(() => {
    // Listen to notification clicks while the app is running (foreground or background)
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      // Explicitly dismiss the clicked notification from the status bar tray
      const id = response.notification.request.identifier;
      void Notifications.dismissNotificationAsync(id);

      if (navigationRef.isReady()) {
        try {
          // Navigate to "Patient" stack and target "QueueStatus" tab (my appointments)
          navigationRef.navigate('Patient', { screen: 'QueueStatus' });
        } catch (err) {
          console.log('Navigation from notification failed:', err);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleInitialNotification = async () => {
    try {
      // Check if the app was launched by clicking a notification (cold start)
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response && navigationRef.isReady()) {
        // Route the user directly to active appointments (QueueStatus)
        navigationRef.navigate('Patient', { screen: 'QueueStatus' });
      }
    } catch (err) {
      console.log('Error handling cold start notification:', err);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer 
            ref={navigationRef}
            onReady={handleInitialNotification}
          >
            <StatusBar style="dark" />
            <Root />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
