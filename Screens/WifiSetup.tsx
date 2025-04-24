import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

type WifiEntry = {
  SSID: string;
  BSSID: string;
  level?: number;
};

export default function WifiSetup() {
  const [networks, setNetworks] = useState<WifiEntry[]>([]);
  const [selectedSsid, setSelectedSsid] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const status = await check(permission);

    if (status === RESULTS.DENIED) {
      const newStatus = await request(permission);
      if (newStatus !== RESULTS.GRANTED) {
        Alert.alert('Permission Required', 'Wi-Fi scanning requires location permission.');
        return;
      }
    } else if (status !== RESULTS.GRANTED) {
      Alert.alert('Permission Required', 'Wi-Fi scanning requires location permission.');
      return;
    }

    checkLocationEnabled();
  };

  const checkLocationEnabled = async () => {
    const isLocationEnabled = await DeviceInfo.isLocationEnabled();
    if (!isLocationEnabled) {
      Alert.alert(
        'Turn on Location', 
        'Wi-Fi scanning requires location services to be enabled.', 
        [{ text: 'OK', onPress: () => {} }]
      );
    } else {
      scanNetworks();
    }
  };

  const scanNetworks = async () => {
    try {
      const results: WifiEntry[] = await WifiManager.loadWifiList();
      setNetworks(results);
    } catch (error) {
      console.error('Wi-Fi Scan Error:', error);
    }
  };

  const sendWifiCredentials = async () => {
    try {
      const response = await fetch('http://192.168.4.1/set-wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid: selectedSsid, password }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Wi-Fi credentials sent successfully');
      } else {
        Alert.alert('Error', 'Failed to send Wi-Fi credentials');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Wi-Fi Networks</Text>
      <FlatList
        data={networks}
        keyExtractor={(item) => item.BSSID}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.networkItem} onPress={() => setSelectedSsid(item.SSID)}>
            <Text style={styles.networkText}>{item.SSID}</Text>
            <MaterialIcons name="wifi" size={24} color="white" style={{ opacity: (item.level || 3) / 5 }} />
          </TouchableOpacity>
        )}
      />

      {selectedSsid ? (
        <View style={styles.inputContainer}>
          <Text style={styles.selectedText}>Selected: {selectedSsid}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Wi-Fi Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.connectButton} onPress={sendWifiCredentials}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.wave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0077b6",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  networkItem: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  networkText: {
    fontSize: 16,
    color: "white",
  },
  inputContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
  },
  selectedText: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "white",
    padding: 10,
    borderRadius: 5,
    color: "white",
  },
  connectButton: {
    marginTop: 10,
    backgroundColor: "#00b4d8",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  wave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
