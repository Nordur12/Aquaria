import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, ImageBackground, Alert,Switch } from 'react-native';
import styles from './Style/CreateAccountD.ts';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


export default function CreateAccountForm(props: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,32}$/;

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }
  
    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Error',
        'Password must contain both letters and numbers, and be 8-32 characters long.'
      );
      return;
    }
  
    try {
      // Create user with Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      if (user) {
        // Send email verification to the user
        await user.sendEmailVerification();
        console.log('Verification email sent');
  
        // Save user information to Firestore
        await firestore().collection('users').doc(user.uid).set({
          username,
          email,
          createdAt: firestore.FieldValue.serverTimestamp(),
          emailVerified: false, // Track email verification status
        });
  
        console.log('Account created and user data saved to Firestore');
  
        // Navigate to the email verification screen
        props.navigation.navigate('Verify Email');
      }
    } catch (error) {
      console.error('Error creating account:', error);
  
      // Type cast the error to FirebaseAuthTypes.NativeFirebaseAuthError
      const firebaseError = error as FirebaseAuthTypes.NativeFirebaseAuthError;
  
      // Display an appropriate error message
      let errorMessage = 'There was an error creating the account. Please try again.';
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid. Please enter a valid email.';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. Please choose a stronger password.';
      }
  
      Alert.alert('Error', errorMessage);
  
      // Stop further execution if an error occurs
      return;
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
      <Text style={styles.headerText}>Create Account</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#696666"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#696666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#696666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#696666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />
        <View style={styles.showPasswordContainer}>
        <Text style={styles.showPasswordText}>Show Password</Text>
          <Switch
            value={showPassword}
            onValueChange={setShowPassword}
          />
          </View>
        </View>

      <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <View style={styles.alreadyHaveAccountContainer}>
        <Text style={styles.alreadyHaveAccountText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => props.navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};