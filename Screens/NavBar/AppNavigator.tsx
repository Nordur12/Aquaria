import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from "../Home.tsx";
import Timer from './Timer.tsx';
import History from './History.tsx';
import { Image, Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator 
    screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#f8f8f8', // Change background color
          borderTopWidth: 2, // Remove border on top
          height: 60, // Adjust height
          paddingBottom: 5, // Padding at the bottom
        },
      }}
      >
      <Tab.Screen
        name="Home" 
        component={Home}
        options={{
          tabBarLabel: () => (
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>Home</Text>
          ),
          
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? '#c3c9e6' : 'transparent',
              borderRadius: 20, // Adjust as needed
              padding: 1,
              paddingHorizontal: 15, // Add some padding
            }}>
              <Image source={require('../../Assets/Images/fish1.png')} style={{ width: 30, height: 30 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={Timer}
        options={{
            tabBarLabel: () => (
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>Feed</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? '#c3c9e6' : 'transparent',
              borderRadius: 20, // Adjust as needed
              padding: 1,
              paddingHorizontal: 15, // Add some padding
            }}>
            <Image source={require('../../Assets/Images/time.png')} style={{ width: 30, height: 30 }} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
            tabBarLabel: () => (
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'black' }}>History</Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? '#c3c9e6' : 'transparent',
              borderRadius: 20, // Adjust as needed
              padding: 1,
              paddingHorizontal: 15, // Add some padding
            }}>
            <Image source={require('../../Assets/Images/retime.png')} style={{ width: 30, height: 30 }} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
