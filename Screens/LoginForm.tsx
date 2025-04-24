import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ImageBackground, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import styles from './Style/LoginD';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

function LoginForm(props: any) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setIdentifier('');
      setPassword('');
      setShowPassword(false);
    }, [])
  );

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('User is authenticated:', user.uid);
      } else {
        console.log('No user is authenticated');
      }
    });
  
    return unsubscribe;
  }, []);
  
  const handleLogin = async () => {
    if (!identifier.trim() && !password.trim()) {
      Alert.alert('Please enter both email and password.');
      return;
    }
    if (!identifier.trim()) {
      Alert.alert('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Please enter your password.');
      return;
    }
  
    try {
      let userCredential;
  
      // Check if the identifier is an email or username
      if (identifier.includes('@')) {
        userCredential = await auth().signInWithEmailAndPassword(identifier, password);
      } else {
        // Query Firestore for the username
        const usersCollection = firestore().collection('users');
        const querySnapshot = await usersCollection.where('username', '==', identifier).get();
  
        if (querySnapshot.empty) {
          throw new Error('No user found with that username');
        }
  
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().email;
  
        // Use the retrieved email to log in
        userCredential = await auth().signInWithEmailAndPassword(userEmail, password);
      }
  
      if (userCredential) {
        const user = userCredential.user;
        if (user.emailVerified) {
          console.log('User logged in:', user);
        } else {
          Alert.alert('Email not verified', 'Please verify your email before logging in.');
          
          try {
            await user.sendEmailVerification(); // Ensure the function is async
            console.log('Verification email sent');
          } catch (error) {
            console.error('Error sending verification email:', error);
          }
      
          props.navigation.navigate('Verify Email');
        }
      }
    } catch (error: any) {
      let errorMessage = 'An error occurred. Please try again.';
      console.error('Full error object:', error);
  
      if (error && error.code) {
        switch (error.code) {
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Incorrect Username or Password';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No user is registered with that username or email.';
            break;
          default:
            errorMessage = 'An unexpected error occurred.';
        }
      }
  
      Alert.alert('Login Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <ImageBackground source={require('../Assets/Images/fishD.png')} style={styles.Mcon}></ImageBackground>
      </View>
      <Text style={styles.text}>SMART AQUARIA</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#696666"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#696666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? require('../Assets/Images/EyeOff.png') : require('../Assets/Images/EyeOn.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => props.navigation.navigate('Forgot Password')}>
          <Text style={styles.forgetPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.accountText}>Don't have an account yet?</Text>

        <TouchableOpacity onPress={() => props.navigation.navigate('Create Account')}>
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate('Wifi Setup')}>
          <Text style={styles.createAccountText}>Setup WiFi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default LoginForm;
