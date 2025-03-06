import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import 'react-native-gesture-handler';

import LoginForm from './Screens/LoginForm';
import CreateAccountForm from './Screens/CreateAccounForm';
import Fpassword from './Screens/Fpassword';
import EmailVerification from './Screens/EmailVerification';
import AppNavigator from './Screens/NavBar/AppNavigator';
import RegDevice from './Screens/RegDevice';
import WaterCH from './Screens/WaterCH';
import Home from './Screens/Home';
import Notification from './Screens/Notification';

// Request permission for notifications
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted');
  } else {
    console.log('Notification permission denied');
  }
}

// Function to store token in Firestore
const storeTokenInFirestore = async (token: string) => {
  const user = auth().currentUser;
  if (user && user.emailVerified) { // Ensure the user is authenticated and email is verified
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          fcmToken: token,
        });
      console.log('FCM Token stored in Firestore');
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  } else {
    console.log('User is not authenticated or email is not verified');
  }
};


const Stack = createNativeStackNavigator();

function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          setUser(currentUser); // Only set the user if email is verified
        } else {
          // If email is not verified, navigate to Verify Email screen
          setUser(null);
        }
      } else {
        setUser(null);
      }
      if (initializing) setInitializing(false);
    });
  
    return unsubscribe; // Cleanup on unmount
  }, [initializing]);  
  
  // Request notification permission and handle FCM token
  useEffect(() => {
    requestUserPermission();

    // Get FCM Token
    messaging()
      .getToken()
      .then((token) => {
        console.log('FCM Token:', token);
        // Optionally, store the token in Firestore for sending targeted notifications later
        storeTokenInFirestore(token);
      })
      .catch((error) => {
        console.log('Error getting FCM token:', error);
      });

    // Handle notifications when the app is in the background
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened from background:', remoteMessage.notification);
    });

    // Handle notifications when the app is opened from quit state
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification opened from quit state:', remoteMessage.notification);
      }
    });

    // Handle foreground notifications
    const unsubscribeMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification:', remoteMessage.notification);
      // You can display an alert or a custom notification here
    });

    // Cleanup notification listeners
    return () => {
      unsubscribeNotificationOpened();
      unsubscribeMessage();
    };
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Authenticated stack
          <>
            <Stack.Screen
              name="Homescreen"
              component={AppNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegDev"
              component={RegDevice}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Wat"
              component={WaterCH}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notif"
              component={Notification}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Unauthenticated stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginForm}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Create Account"
              component={CreateAccountForm}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Forgot Password"
              component={Fpassword}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Verify Email"
              component={EmailVerification}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
