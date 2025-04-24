import React, { useState, useEffect, useCallback  } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database"; 
import { useFocusEffect } from "@react-navigation/native";
import styles from "./Style/profileS"; // Ensure correct path

export default function Profile(props: any) {
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  const [aquariums, setAquariums] = useState<{ id: string; name: string; deviceId: string; connected: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  // Separate modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Input states
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>(null);

  

  const userId = auth().currentUser?.uid ?? ""; // ✅ Ensure userId is always a string

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch User Data
        const userDoc = await firestore().collection("users").doc(userId).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          setUserData({ username: data?.username || "Unknown" });
        }

        // Fetch Aquariums
        const aquariumsQuery = await firestore().collection("aquariums").where("userId", "==", userId).get();

        const aquariumsList = aquariumsQuery.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          deviceId: doc.data().deviceId || "",
          connected: Boolean(doc.data().deviceId),
        }));

        setAquariums(aquariumsList);
      } catch (error) {
        console.error("Error fetching profile data:", error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

   // ✅ Function to fetch aquariums
   const fetchAquariums = async () => {
    try {
      setLoading(true);

      const aquariumsQuery = await firestore()
        .collection("aquariums")
        .where("userId", "==", userId)
        .get();

      const aquariumsList = aquariumsQuery.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        deviceId: doc.data().deviceId || "",
        connected: Boolean(doc.data().deviceId),
      }));

      setAquariums(aquariumsList);
    } catch (error) {
      console.error("Error fetching aquariums:", error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAquariums();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchAquariums();
    }, [])
  );


  const registerDevice = async (aquariumId: string, deviceId: string) => {
    if (!deviceId.trim()) {
      Alert.alert("Error", "Device ID cannot be empty.");
      return;
    }
  
    try {
      const deviceRef = database().ref(`/devices/${deviceId}`);
      const deviceSnapshot = await deviceRef.once("value");
  
      if (!deviceSnapshot.exists()) {
        Alert.alert("Error", "Device ID does not exist.");
        return;
      }
  
      const deviceData = deviceSnapshot.val();
  
      if (deviceData.aquariumId) {
        Alert.alert("Error", "This device is already registered to another aquarium.");
        return;
      }
      await firestore().collection("aquariums").doc(aquariumId).update({
        deviceId,
      });
      await deviceRef.update({
        userId,
        aquariumId,
        registeredAt: new Date().toISOString(),
      });
  
      Alert.alert("Success", "Device registered successfully.");
      fetchAquariums(); 
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };
  
  

  // Disconnect Device from Aquarium
  const disconnectDevice = async (aquariumId: string, deviceId: string) => {
    try {
      const deviceRef = database().ref(`/devices/${deviceId}`);
  
      // Remove device association in Firestore
      await firestore().collection("aquariums").doc(aquariumId).update({
        deviceId: null,
      });
  
      // Remove device association in Realtime Database
      await deviceRef.update({
        userId: null,
        aquariumId: null,
      });
  
      Alert.alert("Success", "Device disconnected successfully.");
  
      // Refresh data after successful disconnection
      fetchAquariums();
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };
  

   // 🚀 Delete Account Function
  const deleteAccount = async () => {
    const user = auth().currentUser;
    if (!user) return;

    setLoading(true);

    try {
      const credential = auth.EmailAuthProvider.credential(user.email ?? "", password);
      await user.reauthenticateWithCredential(credential);

      const aquariumsSnapshot = await firestore()
        .collection("aquariums")
        .where("userId", "==", user.uid)
        .get();

      const batch = firestore().batch();

      for (const doc of aquariumsSnapshot.docs) {
        const aquarium = doc.data();
        const aquariumId = doc.id;

        if (aquarium.deviceId) {
          const deviceRef = database().ref(`/devices/${aquarium.deviceId}`);
          await deviceRef.update({
            aquariumId: null,
            userId: null,
            registeredAt: null,
          });

          batch.update(firestore().collection("aquariums").doc(aquariumId), {
            deviceId: firestore.FieldValue.delete(),
          });
        }

        batch.delete(firestore().collection("aquariums").doc(aquariumId));
      }

      await batch.commit();
      await firestore().collection("users").doc(user.uid).delete();
      await user.delete();

      Alert.alert("Account Deleted", "Your account and connected devices have been removed.", [
        {
          text: "OK",
          onPress: () => props.navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      const err = error as Error;
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#3498db" style={styles.loader} />;
  }

  return (
  <ScrollView style={styles.container}>
    <Text style={styles.title}>🐠 Profile</Text>

    {userData && (
      <View style={styles.card}>
        <Text style={styles.label}>👤 Username:</Text>
        <Text style={styles.value}>{userData.username}</Text>
      </View>
    )}

    <Text style={styles.subtitle}>🌊 Your Aquariums</Text>
    {aquariums.length > 0 ? (
      aquariums.map((aquarium) => (
        <View key={aquarium.id} style={[styles.card, styles.aquariumBox]}>
          <Text style={styles.aquariumName}>
            {aquarium.connected ? "✅ Connected" : "❌ Disconnected"} - {aquarium.name}
          </Text>
          <Text style={styles.deviceId}>📟 Device: {aquarium.deviceId || "No Device Assigned"}</Text>

          {aquarium.connected ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => disconnectDevice(aquarium.id, aquarium.deviceId)}
            >
              <Text style={styles.disconnectButtonText}>Disconnect Device</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => {
                setSelectedAquarium(aquarium.id);
                setModalVisible(true); // Only for Register Device
              }}
            >
              <Text style={styles.registerButtonText}>Register Device</Text>
            </TouchableOpacity>
          )}
        </View>
      ))
    ) : (
      <Text style={styles.noData}>You have no registered aquariums. 🐟</Text>
    )}

    {/* ⚠️ Register Device Modal */}
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Register Device</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Device ID"
            value={deviceId}
            onChangeText={setDeviceId}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, deviceId ? styles.modalButtonActive : styles.modalButtonDisabled]}
              onPress={() => {
                if (selectedAquarium) {
                  registerDevice(selectedAquarium, deviceId);
                  setModalVisible(false);
                  setDeviceId("");
                }
              }}
              disabled={!deviceId}
            >
              <Text style={styles.modalButtonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => {
                setModalVisible(false);
                setDeviceId("");
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* 🗑️ Delete Account Button */}
    <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
      <Text style={styles.deleteButtonText}>Delete Account</Text>
    </TouchableOpacity>

      {/* ⚠️ Delete Account Confirmation Modal */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>Enter your password to confirm account deletion:</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, password ? styles.modalButtonActive : styles.modalButtonDisabled]}
                onPress={deleteAccount}
                disabled={!password}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setPassword("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}