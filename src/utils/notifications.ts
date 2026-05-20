import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    // Token is needed for push notifications (FCM/APNs), 
    // but not strictly for local scheduled notifications.
    // Expo Go SDK 53+ doesn't support remote push notifications.
    // We only need local notifications, so we skipped fetching the push token.
    token = "local-token-only";
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleQueueNotification(
  tokenNumber: number,
  peopleAhead: number,
  estimatedTime: number,
  serviceName?: string,
  currentServing?: number
) {
  let title = `🔵 In Queue (Token #${tokenNumber})`;
  let body = '';

  const callTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (peopleAhead === 0) {
    title = `🏃‍♂️ It's Your Turn Now!`;
    body = `Token #${tokenNumber} is being called. Please proceed to the doctor's room immediately.\n⚠️ Your turn has arrived! Please come quickly. We will wait for 5 minutes. If you do not arrive within 5 minutes, we will proceed to call the next patient.\nCalled at: ${callTime}`;
  } else if (peopleAhead <= 2) {
    title = `🔴 Turn Very Close! (${peopleAhead} ahead)`;
    body = `Token #${tokenNumber} | Serving: #${currentServing || '-'}. Please be ready outside!`;
  } else if (peopleAhead <= 5) {
    title = `🟡 Turn Approaching (${peopleAhead} ahead)`;
    body = `Token #${tokenNumber} | Serving: #${currentServing || '-'}`;
  } else {
    title = `🔵 Waiting in Queue (${peopleAhead} ahead)`;
    body = `Token #${tokenNumber} | Serving: #${currentServing || '-'}`;
  }

  // Calculate Expected Arrival
  if (peopleAhead > 0 && estimatedTime >= 0) {
    const arrivalDate = new Date(Date.now() + estimatedTime * 60 * 1000);
    const expectedArrival = arrivalDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    body += `\nEst. Wait: ${estimatedTime}m | Expected Arrival: ${expectedArrival}`;
  }

  if (serviceName) {
    body = `Dr. ${serviceName}\n${body}`;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: 'active-queue-notification',
      content: {
        title,
        body,
        sound: true,
        sticky: false, // Make it swipeable
        autoDismiss: true, // Auto-dismiss on click
        color: peopleAhead === 0 ? '#16a34a' : peopleAhead <= 2 ? '#dc2626' : peopleAhead <= 5 ? '#ca8a04' : '#2563eb',
      },
      trigger: null, // trigger immediately
    });
  } catch (err) {
    console.log('Error scheduling notification:', err);
  }
}

export async function dismissActiveQueueNotification() {
  try {
    await Notifications.dismissNotificationAsync('active-queue-notification');
  } catch (err) {
    console.log('Error dismissing notification:', err);
  }
}

