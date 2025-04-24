import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Alert } from 'react-native';
import { useEffect } from 'react';

// Function to ensure title and message are always strings
const getString = (value: any): string => {
  return typeof value === 'string' ? value : JSON.stringify(value);
};

// ✅ Create a notification channel (Android 8+)
const createNotificationChannel = () => {
  PushNotification.createChannel(
    {
      channelId: "default-channel", // Must match the channelId in localNotification
      channelName: "Default Channel",
      importance: 4, // 🔥 MAX importance for Floating Notifications
      vibrate: true,
    },
    (created) => console.log(`Notification channel created: ${created}`)
  );
};

// ✅ Show Floating (Heads-up) Notification
const showLocalNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  const title = getString(remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification');
  const message = getString(remoteMessage.notification?.body || remoteMessage.data?.message || 'No message provided');

  // Show an alert if the notification requires it
  if (remoteMessage.data?.popup === 'true') {
    Alert.alert(title, message);
  }

  // 🔔 Trigger a local push notification (Floating Notification)
  PushNotification.localNotification({
    channelId: "default-channel", // Must match the created channel
    title,
    message,
    playSound: true,
    soundName: "default",
    vibrate: true,
    priority: "high", // 🔥 Makes the notification heads-up (Floating)
    importance: "high", // 🔥 Required for floating notification
  });
};

const NotificationListener = () => {
  useEffect(() => {
    createNotificationChannel(); // Create notification channel on app start

    // Handle when user taps on the notification (Background & Quit State)
    const onOpenApp = messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Notification caused app to open:', remoteMessage);
    });

    // Handle when the app is opened from a killed state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
        }
      });

    // Handle foreground notifications
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Received notification in foreground:', remoteMessage);
      showLocalNotification(remoteMessage);
    });

    return () => {
      unsubscribeOnMessage();
      onOpenApp();
    };
  }, []);

  return null;
};

export default NotificationListener;
