import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, Alert, View, Text, StyleSheet, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

interface Aquarium {
  id: string;
  name: string;
  deviceId?: string;  // Optional deviceId to check if aquarium is connected to a device
}

export default function RegDevice() {
  const [deviceId, setDeviceId] = useState('');
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState('');
  const navigation = useNavigation();

  const handleBackPress = () => {
    console.log('Back button pressed, navigating to Home...');
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      backHandler.remove();
    };
  }, []);

  // Function to fetch aquariums
  const fetchAquariums = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      const querySnapshot = await firestore()
        .collection('aquariums')
        .where('userId', '==', userId)
        .get();

      const aquariumData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        deviceId: doc.data().deviceId,
      }));

      console.log('Fetched aquariums:', aquariumData);  // Check the fetched data
      setAquariums(aquariumData);
    } catch (error) {
      console.error('Error fetching aquariums:', error);
      Alert.alert('Error', 'Failed to fetch aquariums.');
    }
  };

  // Fetch aquariums when the component mounts
  useEffect(() => {
    fetchAquariums();
  }, []);

  // Register device handler
  const handleRegisterDevice = async () => {
    console.log('Register button clicked');

    if (!deviceId || !selectedAquariumId) {
      Alert.alert('Error', 'Please enter a device ID and select an aquarium.');
      return;
    }

    // Check if the selected aquarium already has a device connected
    const selectedAquarium = aquariums.find(aquarium => aquarium.id === selectedAquariumId);
    if (selectedAquarium?.deviceId) {
      Alert.alert('Error', 'This aquarium is already connected to a device.');
      return;
    }

    try {
      const deviceRef = database().ref(`/devices/${deviceId}`);
      const snapshot = await deviceRef.once('value');

      if (!snapshot.exists()) {
        Alert.alert('Error', 'Device ID does not exist.');
        return;
      }

      const deviceData = snapshot.val();
      if (deviceData.userId) {
        Alert.alert('Error', 'Device is already registered to another user.');
        return;
      }

      // Register the device under the selected aquarium
      await deviceRef.update({
        deviceId,
        aquariumId: selectedAquariumId,
        userId: auth().currentUser?.uid, // Replaced ownerId with userId
        registeredAt: new Date().toISOString(),
      });

      // Update the aquarium document with the new device ID
      await firestore()
        .collection('aquariums')
        .doc(selectedAquariumId)
        .update({
          deviceId,  // Save deviceId to aquarium document
        });

      // Update the local aquarium state to reset data fields
      setAquariums(prevAquariums =>
        prevAquariums.map(aquarium =>
          aquarium.id === selectedAquariumId
            ? { ...aquarium, turbidity: '', phLevel: '', temperature: '' } // Reset data fields
            : aquarium
        )
      );

      Alert.alert('Success', 'Device registered successfully!');
      setDeviceId('');
      setSelectedAquariumId('');
    } catch (error) {
      console.error('Error registering device:', error);
      Alert.alert('Error', 'Failed to register device. Please try again.');
    }
  };

  // Disconnect device handler
  const handleDisconnectDevice = async () => {
    const selectedAquarium = aquariums.find(aquarium => aquarium.id === selectedAquariumId);
    if (!selectedAquarium?.deviceId) {
      Alert.alert('Error', 'This aquarium is not connected to any device.');
      return;
    }

    try {
      const deviceRef = database().ref(`/devices/${selectedAquarium.deviceId}`);
      // Update Realtime Database fields
      await deviceRef.update({
        aquariumId: null,
        userId: null,
        registeredAt: null,
      });

      // Remove deviceId field from Firestore aquariums collection
      await firestore()
        .collection('aquariums')
        .doc(selectedAquariumId)
        .update({
          deviceId: firestore.FieldValue.delete(), // Completely remove the field
        });

      // Reset the aquarium data fields in state
      setAquariums(prevAquariums =>
        prevAquariums.map(aquarium =>
          aquarium.id === selectedAquariumId
            ? { ...aquarium, turbidity: '', phLevel: '', temperature: '' } // Reset data fields
            : aquarium
        )
      );

      Alert.alert('Success', 'Device disconnected successfully!');
      setDeviceId('');
      setSelectedAquariumId('');
    } catch (error) {
      console.error('Error disconnecting device:', error);
      Alert.alert('Error', 'Failed to disconnect device. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Enter Device ID:</Text>
      <TextInput
        placeholder="Device ID"
        value={deviceId}
        onChangeText={setDeviceId}
        style={styles.input}
      />

      <Text style={styles.label}>Select Aquarium:</Text>
      <Picker
        selectedValue={selectedAquariumId}
        onValueChange={(value) => setSelectedAquariumId(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select an Aquarium" value="" />
        {aquariums.map((aquarium) => (
          <Picker.Item key={aquarium.id} label={aquarium.name} value={aquarium.id} />
        ))}
      </Picker>

      <Button title="Register Device" onPress={handleRegisterDevice} />
      <Button title="Disconnect Device" onPress={handleDisconnectDevice} />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  picker: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
  },
});
