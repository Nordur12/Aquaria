import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Button } from "react-native-paper";

export default function Notification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      setLoading(false);
      return;
    }

    // Firestore query with error handling
    const unsubscribe = firestore()
      .collection("notifications")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          if (!snapshot || snapshot.empty) {
            console.log("No notifications found.");
            setNotifications([]);
          } else {
            console.log("Fetched notifications:", snapshot.docs.map((doc) => doc.data())); // Debug log
            setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching notifications:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await firestore().collection("notifications").doc(id).update({ isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await firestore().collection("notifications").doc(id).delete();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.isRead ? "#f0f0f0" : "#d1e7ff",
              padding: 16,
              marginVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.title}</Text>
            <Text style={{ fontSize: 14, marginTop: 4 }}>{item.message}</Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              {!item.isRead && (
                <Button mode="contained" onPress={() => markAsRead(item.id)} style={{ marginRight: 10 }}>
                  Mark as Read
                </Button>
              )}
              <Button mode="contained" buttonColor="red" onPress={() => deleteNotification(item.id)}>
                Delete
              </Button>
            </View>
          </View>
        )}
      />
    </View>
  );
}
