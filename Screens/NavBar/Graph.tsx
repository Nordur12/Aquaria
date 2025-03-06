import React, { useState, useEffect, useCallback } from "react";
import { Alert, View, Text, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import BackgroundFetch from 'react-native-background-fetch';
import styles from './Graph1.ts';

interface Aquarium {
  id: string;
  name: string;
  deviceId: any;
}

interface SensorData {
  phLevel: number[];
  turbidity: number[];
}

type SensorParameter = 'phLevel' | 'turbidity'; // Add more as needed

const Graph = () => {
  const [dataByAquarium, setDataByAquarium] = useState<{ [aquariumId: string]: SensorData }>({});
  const [timeLabelsByAquarium, setTimeLabelsByAquarium] = useState<{ [aquariumId: string]: string[] }>({});
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState('');
  const [selectedParameter, setSelectedParameter] = useState<SensorParameter>("phLevel");
  const [refreshing, setRefreshing] = useState(false);
  
  const maxChartCapacity = 10; // Maximum number of data points to display

  const defaultSensorData: SensorData = {
    phLevel: Array(maxChartCapacity).fill(0), 
    turbidity: Array(maxChartCapacity).fill(0),
  };

  const [extremeValuesByAquarium, setExtremeValuesByAquarium] = useState<{
    [aquariumId: string]: {
      [parameter in SensorParameter]?: {
        highest: { value: number; timestamp: string };
        lowest: { value: number; timestamp: string };
      };
    };
  }>({});

  BackgroundFetch.configure({
    minimumFetchInterval: 1, // Fetch every 1 minute
    stopOnTerminate: false,  // Continue after app is terminated
    startOnBoot: true,       // Start on device reboot
    enableHeadless: true,
  }, async (taskId) => {
    console.log('[BackgroundFetch] task received: ', taskId);
    
    // Fetch aquariums and update data
    const userId = auth().currentUser?.uid;
    if (!userId) {
      console.warn('User not authenticated.');
      BackgroundFetch.finish(taskId); // Finish task
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
      })) as Aquarium[];

      setAquariums(aquariumData);

      // For each selected aquarium, fetch sensor data
      if (selectedAquariumId) {
        const selectedAquarium = aquariumData.find(aquarium => aquarium.id === selectedAquariumId);
        if (selectedAquarium) {
          const deviceRef = database().ref(`devices/${selectedAquarium.deviceId}/data`);

          deviceRef.child("turbidityData").once("value", snapshot => {
            if (snapshot.exists()) {
              const turbidityData = snapshot.val()?.NTU || 0;
              updateExtremes(selectedAquariumId, "turbidity", turbidityData);
            }
          });

          deviceRef.child("phlevel").once("value", snapshot => {
            if (snapshot.exists()) {
              const phLevelData = snapshot.val()?.pHLevel || 0;
              updateExtremes(selectedAquariumId, "phLevel", phLevelData);
            }
          });
        }
      }

    } catch (error) {
      console.error('Error fetching aquariums or sensor data:', error);
    }

    // Mark the background task as finished
    BackgroundFetch.finish(taskId);
  }, (error) => {
    console.log('[BackgroundFetch] failed to start: ', error);
  });

  // Helper to update the extreme values (highest/lowest) for a sensor parameter
  const updateExtremes = (aquariumId: string, parameter: SensorParameter, newValue: number) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setExtremeValuesByAquarium((prevValues) => {
      const updatedValues = { ...prevValues };
      const aquariumValues = updatedValues[aquariumId] || {};
      const parameterValues = aquariumValues[parameter] || {
        highest: { value: Number.MIN_VALUE, timestamp: '' },
        lowest: { value: Number.MAX_VALUE, timestamp: '' },
      };

      // Update highest value
      if (newValue > parameterValues.highest.value) {
        parameterValues.highest = { value: newValue, timestamp };
      }

      // Update lowest value
      if (newValue < parameterValues.lowest.value) {
        parameterValues.lowest = { value: newValue, timestamp };
      }

      aquariumValues[parameter] = parameterValues;
      updatedValues[aquariumId] = aquariumValues;

      return updatedValues;
    });
  };

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
      })) as Aquarium[];

      setAquariums(aquariumData);
    } catch (error) {
      console.error('Error fetching aquariums:', error);
      Alert.alert('Error', 'Failed to fetch aquariums.');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAquariums().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchAquariums();
  }, []);

  useEffect(() => {
    if (!selectedAquariumId) {
      setDataByAquarium({});
      setTimeLabelsByAquarium({});
    }
  }, [selectedAquariumId]);

  useEffect(() => {
    if (!selectedAquariumId) return;

    const selectedAquarium = aquariums.find((aquarium) => aquarium.id === selectedAquariumId);
    if (!selectedAquarium) {
      console.warn('Selected aquarium not found!');
      return;
    }

    const deviceRef = database().ref(`devices/${selectedAquarium.deviceId}/data`);

    // Listen for changes in turbidity and pH level data
    const handleDataChange = () => {
      deviceRef.child("turbidityData").on("value", snapshot => {
        if (snapshot.exists()) {
          const turbidityData = snapshot.val();
          const newTurbidityData = turbidityData?.NTU || 0;
      
          if (typeof newTurbidityData === "number" && !isNaN(newTurbidityData)) {
            updateExtremes(selectedAquariumId, "turbidity", newTurbidityData);
      
            setDataByAquarium((prevData) => {
              const updatedData = { ...prevData };
              const currentData = updatedData[selectedAquariumId] || { ...defaultSensorData };
      
              currentData.turbidity = [...currentData.turbidity.slice(1), newTurbidityData];
              updatedData[selectedAquariumId] = currentData;
      
              return updatedData;
            });
          }
        }
      });

      deviceRef.child("phlevel").on("value", snapshot => {
        if (snapshot.exists()) {
          const phData = snapshot.val();
          const newPhLevelData = phData?.pHLevel || 0;
      
          if (typeof newPhLevelData === "number" && !isNaN(newPhLevelData)) {
            updateExtremes(selectedAquariumId, "phLevel", newPhLevelData);
      
            setDataByAquarium((prevData) => {
              const updatedData = { ...prevData };
              const currentData = updatedData[selectedAquariumId] || { ...defaultSensorData };
      
              currentData.phLevel = [...currentData.phLevel.slice(1), newPhLevelData];
              updatedData[selectedAquariumId] = currentData;
      
              return updatedData;
            });
          }

          // Update time labels for graph
          setTimeLabelsByAquarium((prevLabels: any) => {
            const updatedLabels = { ...prevLabels };
            const currentLabels = updatedLabels[selectedAquariumId] || Array(maxChartCapacity).fill("");
            const newTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            // Keep only the latest 10 time labels
            const newLabels = [...currentLabels.slice(1), newTimestamp];
            updatedLabels[selectedAquariumId] = newLabels.length > maxChartCapacity ? newLabels.slice(1) : newLabels;
            return updatedLabels;
          });
        }
      });
    };

    handleDataChange();

    return () => {
      deviceRef.child("turbidity").off("value");
      deviceRef.child("phlevel").off("value");
    };
  }, [selectedAquariumId, aquariums]);

  const currentData = dataByAquarium[selectedAquariumId] || defaultSensorData;
  const currentLabels = timeLabelsByAquarium[selectedAquariumId] || Array(maxChartCapacity).fill("");
  const currentExtremes =
  extremeValuesByAquarium[selectedAquariumId]?.[selectedParameter] || {
    highest: { value: 0, timestamp: 'N/A' },
    lowest: { value: 0, timestamp: 'N/A' },
  };

  const chartData = {
    labels: currentLabels,
    datasets: [
      {
        data: currentData[selectedParameter],
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
        strokeWidth: 2,
      },
    ], 
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
    <View style={styles.graphContainer}>
      {/* Aquarium Selector */}
      <View style={styles.selectorContainer}>
        <Text>Select Aquarium:</Text>
        <Picker
          selectedValue={selectedAquariumId}
          onValueChange={(itemValue) => setSelectedAquariumId(itemValue)}
        >
          <Picker.Item label="No aquarium selected" value="" />
          {aquariums.map((aquarium) => (
            <Picker.Item key={aquarium.id} label={aquarium.name} value={aquarium.id} />
          ))}
        </Picker>
      </View>

      {!selectedAquariumId ? (
        <Text style={styles.noDataText}>Please select an aquarium to display its data.</Text>
      ) : (
        <>
          <View style={styles.graph}>
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 10}
              height={250}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForVerticalLabels: {
                  rotation: "50",
                  y: 230,
                  translateX: 10,
                },
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "3", 
                  stroke: "#aae034",
                },
              }}
              bezier
              fromZero={true}
            />
          </View>
        </>
      )}
      {/* Parameter Buttons */}
      <View style={styles.stats}>
      <Text style={styles.extremeText}>
        Highest {selectedParameter === 'phLevel' ? 'pH Level' : 'Turbidity'}: {currentExtremes.highest.value}
        {currentExtremes.highest.timestamp && ` (at ${currentExtremes.highest.timestamp})`}
      </Text>
      <Text style={styles.extremeText}>
        Lowest {selectedParameter === 'phLevel' ? 'pH Level' : 'Turbidity'}: {currentExtremes.lowest.value}
        {currentExtremes.lowest.timestamp && ` (at ${currentExtremes.lowest.timestamp})`}
      </Text>
    </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.phLevelButton}
          onPress={() => setSelectedParameter("phLevel")}
        >
          <Text style={styles.buttonText}>PH LEVEL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.turbidityButton}
          onPress={() => setSelectedParameter("turbidity")}
        >
          <Text style={styles.buttonText}>TURBIDITY</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
};

export default Graph;
