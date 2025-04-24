import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

// Define the structure of feeding history records
interface FeedingHistory {
  id: string;
  aquariumName: string;
  foodType: string;
  foodAmount: string;
  timestamp: number;
}

const History = () => {
  const user = auth().currentUser;
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time listener
    const unsubscribe = firestore()
      .collection("feeding_history")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          if (!snapshot || snapshot.empty) {
            console.log("No feeding history found.");
            setFeedingHistory([]);
            setLoading(false);
            return;
          }

          const data = snapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              aquariumName: docData.aquariumName || "Unknown",
              foodType: docData.foodType || "Unknown",
              foodAmount: docData.foodAmount || "N/A",
              timestamp: docData.timestamp?.toDate?.()?.getTime() || 0, // Fixed timestamp conversion
            };
          });

          setFeedingHistory(data);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching feeding history:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe(); // Cleanup on unmount
  }, [user]);

  // Delete a record
  const deleteHistory = (id: string) => {
    Alert.alert("Delete Record", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await firestore().collection("feeding_history").doc(id).delete();
            console.log("Record deleted successfully.");
          } catch (error) {
            console.error("Error deleting record:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Feeding History</Text>

      {loading ? <ActivityIndicator size="large" color="blue" /> : null}

      <FlatList
        data={feedingHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderBottomWidth: 1,
              borderColor: "#ddd",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold" }}>{item.aquariumName}</Text>
              <Text>{`Food: ${item.foodType}, Amount: ${item.foodAmount} mg`}</Text>
              <Text>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteHistory(item.id)}>
              <Text style={{ color: "red" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default History;
