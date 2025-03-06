{/* import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';

let accumulatedData: { pHLevel: any; turbidity: any; deviceId: any; userId: any; timestamp: string; }[] = [];  // Temporary storage to accumulate data for 1 hour
let lastSaveTimestamp = Date.now();  // Track the last save time to trigger every 1 hour

const fetchDataFromRealtime = async () => {
  try {
    // Fetch the pH and turbidity data from Realtime Database
    const snapshot = await database().ref('/devices/DEVICE_5C07AB455F34').once('value');
    const deviceData = snapshot.val();

    if (deviceData) {
      const { pHLevel, turbidity, deviceId, userId } = deviceData;

      // Check if the user is authorized to record the data
      const userSnapshot = await database().ref(`/users/${userId}/aquariums`).once('value');
      const aquariums = userSnapshot.val();

      let isAuthorized = false;
      // Loop through the aquariums and check if the deviceId matches
      for (const aquariumId in aquariums) {
        if (aquariums[aquariumId].deviceId === deviceId) {
          isAuthorized = true;
          break;
        }
      }

      if (isAuthorized) {
        // Create a timestamp for the current reading
        const timestamp = new Date().toISOString();

        // Accumulate the data
        accumulatedData.push({
          pHLevel: pHLevel,
          turbidity: turbidity,
          deviceId: deviceId,
          userId: userId,
          timestamp: timestamp,
        });

        console.log("Data accumulated for saving...");
      } else {
        console.log("User is not authorized to record data for this device.");
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Function to save accumulated data every 1 hour
const saveDataEveryHour = async () => {
  const currentTimestamp = Date.now();
  const oneHour = 60 * 60 * 1000;  // 1 hour in milliseconds

  // Check if 1 hour has passed since the last save
  if (currentTimestamp - lastSaveTimestamp >= oneHour) {
    try {
      // Save the accumulated data to Firestore
      if (accumulatedData.length > 0) {
        const sensorDataDoc = firestore().collection('sensorData').doc('DEVICE_5C07AB455F34'); // Use deviceId as the document ID

        // Update the sensor data array in Firestore
        await sensorDataDoc.update({
          sensorReadings: firestore.FieldValue.arrayUnion(...accumulatedData),
        });

        console.log("Data saved successfully to Firestore.");

        // Clear the accumulated data and update the last save timestamp
        accumulatedData = [];
        lastSaveTimestamp = currentTimestamp;
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }
};

// Fetch data every 5 seconds, but save every 1 hour
const interval = setInterval(async () => {
  await fetchDataFromRealtime();  // Fetch and accumulate data every 5 seconds
  await saveDataEveryHour();      // Check if it's time to save accumulated data
}, 5000);  // Interval is 5 seconds for fetching data
*/}