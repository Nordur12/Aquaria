import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Alert, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import styles from './Style/EmailVerficationD';

export default function EmailVerification(props: any) {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    Alert.alert('Verification Email Sent', 'A verification email has been sent to your email address.');
    setCooldown(60); 
  }, []); 

  const sendVerificationEmail = async () => {
    const user = auth().currentUser;

    if (!user) {
      Alert.alert('Error', 'No user is currently logged in. Please log in again and try.');
      props.navigation.navigate('Login');
      return;
    }

    try {
      setIsSending(true);
      await user.sendEmailVerification();
      Alert.alert(
        'Verification Email Sent',
        'A verification email has been sent to your email address. Please check your inbox or spam folder.'
      );
      setCooldown(60);
    } catch (error) {
      console.error('Error sending verification email:', error);
      Alert.alert('Error', 'There was an issue sending the verification email. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const checkEmailVerification = async () => {
    const user = auth().currentUser;
    
    if (!user) {
      Alert.alert('Error', 'No user is currently logged in. Please log in again.');
      props.navigation.navigate('Login');
      return;
    }
  
    await user.reload(); // Refresh authentication state
  
    if (user.emailVerified) {
      console.log('Email verified!');
  
      try {
        await firestore().collection('users').doc(user.uid).update({ emailVerified: true });
        console.log('Email verification status updated in Firestore');
  
        Alert.alert('Success', 'Your email has been verified! Please log in again.');
  
        // Sign out the user
        await auth().signOut();
  
        // Navigate back to the login screen
        props.navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }], // Ensure 'Login' is your actual login screen name
        });
  
      } catch (error) {
        console.error('Error updating Firestore:', error);
        Alert.alert('Error', 'Failed to update email verification.');
      }
    } else {
      Alert.alert('Email Not Verified', 'Please verify your email before continuing.');
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.headerText}>Email Verification</Text>
        <Text style={styles.infoText}>
          Please verify your email address to continue. Click the button below to resend a verification email.
        </Text>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: cooldown > 0 ? '#ccc' : '#4CAF50' },
          ]}
          onPress={sendVerificationEmail}
          disabled={isSending || cooldown > 0}
        >
          <Text style={styles.verifyButtonText}>
            {isSending
              ? 'Sending...'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend Verification Email'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={checkEmailVerification}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
