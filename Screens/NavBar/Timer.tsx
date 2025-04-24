import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

interface Aquarium {
  id: string;
  name: string;
  deviceId?: string;
  hasFeeder?: boolean;
  controlsFeeder?: boolean;
}

const Timer = () => {
  const { colors } = useTheme();

  // Instant Feeding State
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState('');
  const [instantFoodType, setInstantFoodType] = useState("");
  const [instantFoodAmount, setInstantFoodAmount] = useState("");

  // Water Pump Control State
  const [isPump1On, setIsPump1On] = useState(false);
  const [isPump2On, setIsPump2On] = useState(false);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
  
     // Firestore real-time listener
     const unsubscribe = firestore()
     .collection('aquariums')
     .where('userId', '==', userId)
     .onSnapshot(
       querySnapshot => {
         const aquariumData = querySnapshot.docs.map(doc => ({
           id: doc.id,
           name: doc.data().name,
           deviceId: doc.data().deviceId,
           hasFeeder: doc.data().hasFeeder || false,
           controlsFeeder: doc.data().controlsFeeder || false,
         }));
 
         console.log('Updated aquariums:', aquariumData);
         setAquariums(aquariumData);
       },
       error => {
         console.error('Error listening to aquariums:', error);
         Alert.alert('Error', 'Failed to listen for aquarium updates.');
       }
     );
 
   return () => unsubscribe();
 }, []);

 const feedNow = async () => {
   if (!selectedAquariumId || !instantFoodType || !instantFoodAmount) {
     Alert.alert("Error", "Please select an aquarium, food type, and amount.");
     return;
   }
 
   const selectedAquarium = aquariums.find(aq => aq.id === selectedAquariumId);
   if (!selectedAquarium) {
     Alert.alert("Error", "Aquarium not found.");
     return;
   }
 
   let deviceId = selectedAquarium.deviceId;
   let servo = "servo1"; // Default to servo1
 
   if (!deviceId) {
     Alert.alert("Error", "No device linked to this aquarium.");
     return;
   }
 
   // Fetch feeder data for the selected device
   const deviceSnapshot = await database().ref(`devices/${deviceId}/feeder`).once('value');
   const feederData = deviceSnapshot.val();
 
   if (!feederData || (!feederData.servo1 && !feederData.servo2)) {
     console.log(`⚠️ Device ${deviceId} has no feeder. Searching for another device with servo2...`);
 
     // Find another device that has servo2 (which controls both feeders)
     const alternateDevice = aquariums.find(aq => aq.deviceId && aq.deviceId !== deviceId);
     
     if (!alternateDevice?.deviceId) {
       Alert.alert("Error", "No available device with a feeder.");
       return;
     }
 
     deviceId = alternateDevice.deviceId;
     servo = "servo2"; // Use servo2 from the alternate device
   }
 
   const deviceRef = database().ref(`devices/${deviceId}/feeder/${servo}`);
 
   const foodWeightPerSpin = instantFoodType === "pellets" ? 2 : 5;
   const requiredSpins = Math.ceil(parseFloat(instantFoodAmount) / foodWeightPerSpin);
 
   console.log(`🍽 Feeding ${instantFoodAmount} mg of ${instantFoodType} using ${requiredSpins} spins on ${servo}.`);
 
   try {
     for (let i = 0; i < requiredSpins; i++) {
       console.log(`🔄 Spin ${i + 1}`);
       await deviceRef.set(true);
       await new Promise(resolve => setTimeout(resolve, 1000));
       await deviceRef.set(false);
       await new Promise(resolve => setTimeout(resolve, 500));
     }
 
     // Save feeding data to Firestore
     await firestore().collection('feeding_history').add({
       userId: auth().currentUser?.uid,
       aquariumName: selectedAquarium.name,
       foodType: instantFoodType,
       foodAmount: instantFoodAmount,
       timestamp: firestore.FieldValue.serverTimestamp(),
     });
 
     Alert.alert("Feeding Complete", `Dispensed ${instantFoodAmount} mg of ${instantFoodType}.`);
   } catch (error) {
     console.error("❌ Error feeding:", error);
     Alert.alert("Error", "Failed to control feeder.");
   }
 };
    
  

  const togglePump = async (pump: 'pump1' | 'pump2', currentState: boolean) => {
    // Step 1: Find the first aquarium with a device that has pumps
    let selectedDeviceId: string | null = null;
  
    for (const aquarium of aquariums) {
      if (!aquarium.deviceId) continue; // Skip if no device is linked
  
      const deviceRef = database().ref(`devices/${aquarium.deviceId}/pumps`);
      const snapshot = await deviceRef.once('value');
  
      if (snapshot.exists()) {
        selectedDeviceId = aquarium.deviceId;
        break; // Stop searching once we find a valid device
      }
    }
  
    if (!selectedDeviceId) {
      Alert.alert('Error', 'No available devices with pump control.');
      return;
    }
  
    const deviceRef = database().ref(`devices/${selectedDeviceId}/pumps`);
  
    try {
      const snapshot = await deviceRef.once('value');
      const pumpsData = snapshot.val();
  
      if (!pumpsData) {
        Alert.alert('Error', 'This device does not support pump control.');
        return;
      }
  
      if (!(pump in pumpsData)) {
        Alert.alert('Error', `Pump ${pump === 'pump1' ? '1' : '2'} not found on this device.`);
        return;
      }
  
      const newPumpState = !currentState;
      console.log(`🔄 Toggling ${pump} on device: ${selectedDeviceId} to ${newPumpState}`);
  
      await database().ref(`devices/${selectedDeviceId}/pumps/${pump}`).set(newPumpState);
  
      if (pump === 'pump1') {
        setIsPump1On(newPumpState);
      } else {
        setIsPump2On(newPumpState);
      }
  
      Alert.alert("Pump Control", `Pump ${pump === 'pump1' ? '1' : '2'} turned ${newPumpState ? 'ON' : 'OFF'}`);
  
    } catch (error) {
      console.error(`❌ Failed to toggle ${pump}:`, error);
      Alert.alert('Error', `Failed to toggle ${pump}.`);
    }
  };
  
  
  

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: "#f4f4f8" }}>
      <View style={styles.card}>
        <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Aquarium:</Text>
          <Picker
            selectedValue={selectedAquariumId}
            onValueChange={(itemValue) => setSelectedAquariumId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select an aquarium" value="" />
            {aquariums.map((aquarium) => (
              <Picker.Item key={aquarium.id} label={aquarium.name} value={aquarium.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Food Type:</Text>
        <Picker selectedValue={instantFoodType} onValueChange={(value) => setInstantFoodType(value)} style={styles.picker}>
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Pellets" value="pellets" />
          <Picker.Item label="Powder" value="Powder" />
        </Picker>

        <Text style={styles.label}>Set Food Amount:(mg)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric" 
          value={instantFoodAmount} 
          onChangeText={setInstantFoodAmount} 
        />

        <TouchableOpacity style={styles.feedButton} onPress={feedNow}>
          <Text style={styles.feedButtonText}>FEED NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Water Pump Control Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Water Pump Control:</Text>
        <TouchableOpacity
  style={[styles.pumpButton, isPump1On ? styles.pumpOn : styles.pumpOff]}
  onPress={() => togglePump('pump1', isPump1On)}
>
  <Text style={styles.pumpButtonText}>
    {isPump1On ? "TURN OFF PUMP 1" : "TURN ON PUMP 1"}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.pumpButton, isPump2On ? styles.pumpOn : styles.pumpOff]}
  onPress={() => togglePump('pump2', isPump2On)}
>
  <Text style={styles.pumpButtonText}>
    {isPump2On ? "TURN OFF PUMP 2" : "TURN ON PUMP 2"}
  </Text>
</TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#dfe3ee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#60338f",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8a1cc9",
    marginBottom: 5,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  picker: {
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 15,
  },
  feedButton: {
    backgroundColor: "#5d2a91",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  feedButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  pumpButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  pumpOn: {
    backgroundColor: "red",
  },
  pumpOff: {
    backgroundColor: "green",
  },
  pumpButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Timer;
