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
  estimatedTime: number
) {
  let title = 'Your Turn is Approaching! 🔔';
  let body = `You are Token #${tokenNumber}. There are ${peopleAhead} patients ahead of you.`;

  if (peopleAhead === 0) {
    title = 'It is your turn now! 🏃‍♂️';
    body = `Please proceed to the doctor's room. Your Token #${tokenNumber} is being called.`;
  } else if (estimatedTime > 0) {
    body += ` Estimated wait time: ${estimatedTime} mins.`;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // trigger immediately
  });
}
