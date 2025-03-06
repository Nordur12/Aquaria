import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Text, RefreshControl, View, Image, TouchableOpacity, Alert, ScrollView, TextInput, BackHandler } from 'react-native';
import Modal from 'react-native-modal';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import styles from './Style/HomeD.ts';

const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return 'th'; 
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const getFormattedDate = () => {
  const now = new Date();
  const day = now.getDate();
  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
  const finalFormattedDate = `${now.toLocaleDateString('en-US', { weekday: 'long' })}, ${dayWithSuffix} ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  
  return finalFormattedDate;
};

const getFormattedTime = () => {
  const now = new Date();
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-US', optionsTime).format(now);
};

interface Aquarium {
  deviceId: any;
  id: string;
  name: string;
  temperature: string;
  phLevel: string;
  turbidity: string;
  userId: string;
}

export default function Home(props: any) {
  const [date, setDate] = useState(getFormattedDate());
  const [time, setTime] = useState(getFormattedTime());
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedAquarium, setSelectedAquarium] = useState<Aquarium | null>(null);
  const [newName, setNewName] = useState('');
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { currentUser } = auth();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      setModalVisible(false);
      setSettingsVisible(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) {
      setModalVisible(false);
      setNotificationVisible(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, [currentUser]);
  
  useEffect(() => {
    const handleBackPress = () => {
      if (isModalVisible) {
        if (isSettingsVisible) {
          setSettingsVisible(false);
        } else if (isNotificationVisible) {
          setNotificationVisible(false);
        } else {
          setModalVisible(false);
        }
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
    return () => {
      if (backHandler && typeof backHandler.remove === 'function') {
        backHandler.remove();
      }
    };
  }, [isModalVisible, isSettingsVisible, isNotificationVisible]);
  

  const fetchAquariums = async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const querySnapshot = await firestore()
        .collection('aquariums')
        .where('userId', '==', userId)
        .get();

      let aquariumsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Aquarium[];

      // Default aquariums creation if less than 2
      if (aquariumsData.length < 2) {
        const defaultAquariums = [
          { name: 'Aquarium 1', temperature: '', phLevel: '', turbidity: '', userId, deviceId: null },
          { name: 'Aquarium 2', temperature: '', phLevel: '', turbidity: '', userId, deviceId: null },
        ];

        for (let i = aquariumsData.length; i < 2; i++) {
          const newAquarium = defaultAquariums[i];
          const docRef = await firestore().collection('aquariums').add(newAquarium);
          aquariumsData.push({
            id: docRef.id,
            ...newAquarium,
          });
        }
      }

      // Data listener
      aquariumsData.forEach(aquarium => {
        if (aquarium.deviceId) {
          const deviceRef = database().ref(`devices/${aquarium.deviceId}/data`);

          // turbidity
          deviceRef.child('turbidityData').on('value', snapshot => {
            if (snapshot.exists()) {
              const newturbidityData = snapshot.val();
              setAquariums(prevAquariums =>
                prevAquariums.map(aq =>
                  aq.id === aquarium.id
                    ? { ...aq, turbidity: `${newturbidityData.NTU.toFixed(2)} NTU` }
                    : aq
                )
              );
        }
            
        
          });

          // pH level
          deviceRef.child('phlevel').on('value', snapshot => {
            if (snapshot.exists()) {
              const phData = snapshot.val();
              setAquariums(prevAquariums =>
                prevAquariums.map(aq =>
                  aq.id === aquarium.id
                    ? { ...aq, phLevel: `${phData.pHLevel.toFixed(2)}` }
                    : aq
                )
              ); 
            }
          });
        }
      });

      setAquariums(aquariumsData);
    } catch (error) {
      console.error('Error fetching aquariums: ', error);
      Alert.alert('Error', 'Failed to fetch aquariums. Please try again later.');
    }
  };

  useEffect(() => {
    fetchAquariums();

    const intervalId = setInterval(() => {
      setDate(getFormattedDate());
      setTime(getFormattedTime());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAquariums().finally(() => setRefreshing(false));
  }, []);

  // Edit Aquarium
  // Inside handleEdit function
  const handleEdit = (aquarium: Aquarium) => {
    const userId = auth().currentUser?.uid;
    if (userId && aquarium.userId === userId) {
      setSelectedAquarium(aquarium); // Set the selected aquarium
      setNewName(aquarium.name); // Pre-fill the name
      setModalVisible(true); // Show the edit modal
    } else {
      Alert.alert('Permission Denied', 'You can only edit your own aquariums.');
    }
  };
  

  
  const handleSave = async () => {
    if (selectedAquarium) {
      const userId = auth().currentUser?.uid;
      if (userId && selectedAquarium.userId === userId) {
        try {
          const aquariumRef = firestore().collection('aquariums').doc(selectedAquarium.id);
          await aquariumRef.update({
            name: newName,
          });
          
          const updatedAquariums = aquariums.map(aquarium =>
            aquarium.id === selectedAquarium.id
              ? { ...aquarium, name: newName }
              : aquarium
          );
          setAquariums(updatedAquariums);
          setModalVisible(false);
          Alert.alert('Success', 'Aquarium updated successfully!');
        } catch (error) {
          console.error('Error updating aquarium: ', error);
          Alert.alert('Error', 'Failed to update aquarium. Please try again later.');
        }
      } else {
        Alert.alert('Permission Denied', 'You can only update your own aquariums.');
      }
    }
  };
  
  const handleDelete = async () => {
    if (selectedAquarium) {
      const userId = auth().currentUser?.uid;
      if (userId && selectedAquarium.userId === userId) {
        try {
          await firestore().collection('aquariums').doc(selectedAquarium.id).delete();
          const updatedAquariums = aquariums.filter(aquarium => aquarium.id !== selectedAquarium.id);
          setAquariums(updatedAquariums);
          setModalVisible(false);
        } catch (error) {
          console.error('Error deleting aquarium: ', error);
          Alert.alert('Error', 'Failed to delete aquarium. Please try again later.');
        }
      } else {
        Alert.alert('Permission Denied', 'You can only delete your own aquariums.');
      }
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
  const handleLogout = async () => {
    try {
      // Sign out the user
      await auth().signOut();
      props.navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again later.');
    }
  };
  if (!userId) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Image source={require('../Assets/Images/setting.png')} style={styles.headerButton} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => props.navigation.navigate("Notif")}>
          <Image source={require('../Assets/Images/bell.png')} style={styles.headerButton} />
        </TouchableOpacity>
      </View>

      <ScrollView 
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.space}></Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        {aquariums.map((aquarium) => (
          <View key={aquarium.id} style={styles.aquariumContainer}>
            <View style={styles.aquariumHeader}>
              <Text style={styles.aquariumName}>{aquarium.name}</Text>
              <TouchableOpacity onPress={() => handleEdit(aquarium)}>
                <Image source={require('../Assets/Images/edit.png')} style={styles.editButtonImage} />
              </TouchableOpacity>
            </View>
            <Text style={styles.textLabel}>TEMPERATURE: {aquarium.temperature}</Text>
            <Text style={styles.textLabel}>PH LEVEL: {aquarium.phLevel}</Text>
            <Text style={styles.textLabel}>TURBIDITY: {aquarium.turbidity}</Text>
            
            <TouchableOpacity style={styles.feedButton} onPress={() => Alert.alert(`Feeding ${aquarium.name}`)}>
              <Text style={styles.feedButtonText}>FEED</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modal for Editing Aquarium */}
      <Modal 
  isVisible={isModalVisible} 
  onBackdropPress={handleCancel}
  onBackButtonPress={handleCancel}
>
  <View style={styles.modalContent}>
    <Text style={styles.modalText}>
      {selectedAquarium?.deviceId 
        ? `Connected Device ID: ${selectedAquarium.deviceId}` 
        : 'No device connected to this aquarium.'}
    </Text>
    <TextInput
      style={styles.modalInput}
      placeholder="New Name"
      value={newName}
      onChangeText={setNewName}
    />
    <View style={styles.modalButtons}>
      <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
        <Text style={styles.modalButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
        <Text style={styles.modalButtonText}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
        <Text style={styles.modalButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



      <Modal
        isVisible={isSettingsVisible}
        onBackdropPress={() => setSettingsVisible(false)}
        onBackButtonPress={() => setSettingsVisible(false)} // Close on back button press
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        style={styles.sideModal}
      >
        <View style={styles.sideModalContent}>
          <TouchableOpacity style={styles.sideModalItem}>
            <Image source={require('../Assets/Images/user.png')} style={styles.sideModalIcon} />
            <Text style={styles.sideModalText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideModalItem} onPress={() => props.navigation.navigate('RegDev')}>
            <Text style={styles.sideModalText}>Register Device</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideModalItem} onPress={() => props.navigation.navigate('Wat')}>
            <Text style={styles.sideModalText}>Water Change</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideModalItem} onPress={handleLogout}>
            <Text style={styles.sideModalText}>Logout</Text>
          </TouchableOpacity>

        </View>
      </Modal>
    </SafeAreaView>
    
  );
}