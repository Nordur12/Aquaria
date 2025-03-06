import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import styles from './TimerD.ts';

interface Aquarium {
  id: string;
  name: string;
  deviceId: any;
}

const Timer = () => {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [selectedAquarium, setSelectedAquarium] = useState('');
  const [feedType, setFeedType] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [selectedSpin, setSelectedSpin] = useState('');
  const [selectedAquariumId, setSelectedAquariumId] = useState('');
  const [feedingInterval, setFeedingInterval] = useState('');
  const [customIntervalModal, setCustomIntervalModal] = useState(false);
  const [customIntervalType, setCustomIntervalType] = useState('');
  const [customIntervalValue, setCustomIntervalValue] = useState('');
  const [spinInput, setSpinInput] = useState<number>(1); // Custom input for spins
  const [unit, setUnit] = useState<'spin' | 'milligrams'>('spin'); // Track selected unit

  useEffect(() => {
    fetchAquariums();
  }, []);

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

      console.log('Fetched aquariums:', aquariumData);
      setAquariums(aquariumData);
    } catch (error) {
      console.error('Error fetching aquariums:', error);
      Alert.alert('Error', 'Failed to fetch aquariums.');
    }
  };

  const handleSaveCustomInterval = () => {
    if (!customIntervalType || !customIntervalValue) {
      Alert.alert('Error', 'Please select and input a valid interval.');
      return;
    }
    setFeedingInterval('CUSTOM');
    setCustomIntervalModal(false);
  };

  const handleCancelCustomInterval = () => {
    setCustomIntervalType('');
    setCustomIntervalValue('');
    setCustomIntervalModal(false);
  };

  const handleFeedNow = () => {
    if (!feedAmount|| !selectedAquariumId || !feedType) {
      Alert.alert('Error', 'Please complete field "Select Aquarium", "Feed Type" and "Feed Amount".');
      return;
    }
    const selectedAquarium = aquariums.find(aquarium => aquarium.id === selectedAquariumId);
    if (selectedAquarium) {
      Alert.alert('Success', `Feeding ${selectedAquarium.name} now`);
    } else {
      Alert.alert('Error', 'Selected aquarium not found.');
    }
  };

  const calculateFeedAmount = (inputAmount: number, unit: 'spin' | 'milligrams') => {
    if (unit === 'spin') {
      setFeedAmount(inputAmount.toString()); // Directly set the feed amount to the number of spins
    } else if (unit === 'milligrams') {
      if (feedType === 'Powder') {
        setFeedAmount((inputAmount / 10).toString()); // 10 mg = 1 spin for Powder
      } else if (feedType === 'Pellet') {
        setFeedAmount((inputAmount / 5).toString()); // 10 mg = 2 spins for Pellet
      }
    }
  };

  const handleStart = () => {
    if (!feedingInterval) {
      Alert.alert('Error', 'Please set a feeding interval before starting.');
      return;
    }
    Alert.alert('Success', 'Feeding timer started!');
  };

  return (
    <View style={styles.container}>
      {/* Select Aquarium */}
      <Text style={styles.label}>Select Aquarium:</Text>
      <Picker
        selectedValue={selectedAquariumId}
        onValueChange={(value) => setSelectedAquariumId(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select an aquarium" value="" />
        {aquariums.map((aquarium) => (
          <Picker.Item key={aquarium.id} label={aquarium.name} value={aquarium.id} />
        ))}
      </Picker>

      {/* Feed Type */}
      <Text style={styles.label}>Feed Type:</Text>
      <Picker
        selectedValue={feedType}
        onValueChange={(value) => setFeedType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select feed type" value="" />
        <Picker.Item label="Powder" value="Powder" />
        <Picker.Item label="Pellet" value="Pellet" />
      </Picker>

      {/* Feed Amount */}
      <Text style={styles.label}>Set Feed Amount:</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, unit === 'spin' && styles.selectedButton]}
          onPress={() => {
            setUnit('spin');
            setFeedAmount(''); // Use the custom spin input
          }}
        >
          <Text style={styles.buttonText}>Spin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, unit === 'milligrams' && styles.selectedButton]}
          onPress={() => {
            setUnit('milligrams');
            calculateFeedAmount(spinInput, 'spin'); // Reset feed amount when "Milligrams" is selected
          }}
        >
          <Text style={styles.buttonText}>Milligrams</Text>
        </TouchableOpacity>

        {/* Input field for custom spin amount */}
        {unit === 'spin' && (
          <TextInput
            style={styles.input} // Define your input style in styles
            keyboardType="numeric"
            value={spinInput.toString()}
            onChangeText={(text) => setSpinInput(Number(text))}
            placeholder="Enter custom spins"
          />
        )}
        {unit === 'milligrams' && (
          <TextInput
            style={styles.input} // Define your input style in styles
            keyboardType="numeric"
            value={spinInput.toString()}
            onChangeText={(text) => setSpinInput(Number(text))}
            placeholder="Enter amount"
          />
        )}
      </View>

      {/* Feeding Interval */}
      <Text style={styles.label}>Set Feeding Interval:</Text>
      <View style={styles.intervalGroup}>
        {['4 HOURS', '8 HOURS', '12 HOURS', 'CUSTOM'].map((interval) => (
          <TouchableOpacity
            key={interval}
            style={[
              styles.intervalButton,
              feedingInterval === interval && styles.selectedButton,
            ]}
            onPress={() =>
              interval === 'CUSTOM'
                ? setCustomIntervalModal(true)
                : setFeedingInterval(interval === feedingInterval ? '' : interval)
            }
          >
            <Text
              style={[
                styles.intervalButtonText,
                feedingInterval === interval && styles.selectedButtonText,
              ]}
            >
              {interval}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Interval Modal */}
      <Modal visible={customIntervalModal} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Select Interval Type:</Text>
            <Picker
              selectedValue={customIntervalType}
              onValueChange={(value) => setCustomIntervalType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select type" value="" />
              <Picker.Item label="Hours" value="Hours" />
              <Picker.Item label="Seconds" value="Seconds" />
            </Picker>
            <Text style={styles.label}>Enter Interval Time:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={customIntervalValue}
              onChangeText={setCustomIntervalValue}
              placeholder="Enter value"
            />
            <View style={styles.modalButtonGroup}>
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveCustomInterval}
              >
                <Text style={styles.actionButtonText}>SAVE</Text>
              </Pressable>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelCustomInterval}
              >
                <Text style={styles.actionButtonText}>CANCEL</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.actionButtonText}>START</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedNowButton} onPress={handleFeedNow}>
          <Text style={styles.actionButtonText}>FEED NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Timer;
