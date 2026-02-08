import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { PALETTE } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: PALETTE.blue600,
        tabBarInactiveTintColor: PALETTE.slate400,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10, // Android shadow
          shadowColor: PALETTE.blue200, // iOS shadow
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10,
          marginBottom: 4,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="enroll"
        options={{
          title: 'Enroll',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-add" : "person-add-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              width: 48,
              borderRadius: 24,
              backgroundColor: focused ? PALETTE.blue50 : 'transparent',
              marginTop: -2, // Optical adjustment
            }}>
              <Ionicons name={focused ? "scan" : "scan-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
