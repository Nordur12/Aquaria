import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Button, Menu, Divider } from "react-native-paper";

export default function Notification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          if (snapshot.empty) {
            setNotifications([]);
            setFilteredNotifications([]);
          } else {
            const fetchedNotifications = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
              };
            });
            setNotifications(fetchedNotifications);
            applyFilters(fetchedNotifications);
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

  const applyFilters = (data: any[]) => {
    let filtered = data.map((item) => {
      let type = "General";
      if (item.title.includes("pH")) type = "pH Level";
      else if (item.title.includes("Turbidity")) type = "Turbidity";
      else if (item.title.includes("Temperature")) type = "Temperature";
  
      return { ...item, type }; // Add type field dynamically
    });
  
    if (filter !== "All") {
      filtered = filtered.filter((item) => item.type === filter);
    }
  
    // Sort unread first, then by date
    filtered.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1; // Unread first
      }
      return sortOrder === "asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
    });
  
    setFilteredNotifications(filtered);
  };
  
  

  useEffect(() => {
    applyFilters(notifications);
  }, [filter, sortOrder, notifications]);

  const markAsRead = async (id: string) => {
    try {
      const user = auth().currentUser;
      if (!user) return;
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("notifications")
        .doc(id)
        .update({ isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const user = auth().currentUser;
      if (!user) return;
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("notifications")
        .doc(id)
        .delete();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Button textColor="#4e1775" onPress={() => setMenuVisible(true)}>{filter}</Button>}
      >
      <Menu.Item onPress={() => { setFilter("All"); setMenuVisible(false); }} title="All"  />
      <Menu.Item onPress={() => { setFilter("pH Level"); setMenuVisible(false); }} title="pH Level" />
      <Menu.Item onPress={() => { setFilter("Turbidity"); setMenuVisible(false); }} title="Turbidity" />
      <Menu.Item onPress={() => { setFilter("Temperature"); setMenuVisible(false); }} title="Temperature" />
      </Menu>

        <Button textColor="#4e1775" onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          Sort: {sortOrder === "asc" ? "Ascending" : "Descending"}
        </Button>
      </View>
      <FlatList
        data={filteredNotifications}
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
            <Text style={{ fontSize: 12, marginTop: 6, color: "gray" }}>
              📅 {item.createdAt.toLocaleString()}
            </Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              {!item.isRead && (
                <Button mode="contained" onPress={() => markAsRead(item.id)} style={{ marginRight: 10 }}>
                  Mark as Read
                </Button>
              )}
              <Button mode="contained" buttonColor="#d91b0f" onPress={() => deleteNotification(item.id)}>
                Delete
              </Button>
            </View>
          </View>
        )}
      />
    </View>
  );
}
