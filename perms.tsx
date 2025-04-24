import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

const requestUserPermission = async () => {
  if (Platform.OS === 'android') {
    // Request FCM permission (Only required for iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      Alert.alert("Notification Permission", "Please enable notifications in settings.");
    }

    // 🔹 Request Android 13+ explicit permission
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Notification Permission", "Please enable notifications in your device settings.");
      }
    }
  }
};

const NotificationListener = () => {
  useEffect(() => {
    requestUserPermission();
  }, []);

  return null;
};

export default NotificationListener;
