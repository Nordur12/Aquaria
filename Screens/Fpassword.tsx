import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, ImageBackground, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import styles from './Style/FpasswordD.ts';

export default function Fpassword(props: any) {
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      props.navigation.navigate('Login');
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <ImageBackground
          source={require('../Assets/Images/fishD.png')}
          style={styles.Mcon}
        >
        </ImageBackground>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.instructions}>
          Enter your email address below and we'll send you a link to reset your password.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#696666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Send Password Reset Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate('Login')}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}