import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, Alert, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import styles from './Style/EmailVerficationD'; // Ensure this path is correct

export default function EmailVerification(props: any) {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Manage cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [cooldown]);

  // Send verification email
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
      setCooldown(60); // Start cooldown for 60 seconds
    } catch (error) {
      console.error('Error sending verification email:', error);
      Alert.alert('Error', 'There was an issue sending the verification email. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle continue button
  const handleContinue = async () => {
    const user = auth().currentUser;
    if (user) {
      await user.reload(); // Refresh user state
      if (user.emailVerified) {
        console.log('Email verified!');
        // Update Firestore
        await firestore()
          .collection('users')
          .doc(user.uid)
          .update({
            emailVerified: true,
          });
        console.log('Email verification status updated in Firestore');
        props.navigation.navigate('Login'); // Navigate to the authenticated screen
      } else {
        console.log('Email not verified yet');
        Alert.alert('Please verify your email before continuing.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.headerText}>Email Verification</Text>
        <Text style={styles.infoText}>
          Please verify your email address to continue. Click the button below to send a verification email.
        </Text>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: cooldown > 0 ? '#ccc' : '#4CAF50' }, // Disable button during cooldown
          ]}
          onPress={sendVerificationEmail}
          disabled={isSending || cooldown > 0} // Disable button while sending or during cooldown
        >
          <Text style={styles.verifyButtonText}>
            {isSending
              ? 'Sending...'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Send Verification Email'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
