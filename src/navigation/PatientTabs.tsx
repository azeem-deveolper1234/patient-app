import React from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import HomeTab from '../screens/patient/HomeTab';
import BookTab from '../screens/patient/BookTab';
import StatusTab from '../screens/patient/StatusTab';
import HistoryTab from '../screens/patient/HistoryTab';
import ReportsTab from '../screens/patient/ReportsTab';
import type { PatientTabParamList } from './types';

const Tab = createMaterialTopTabNavigator<PatientTabParamList>();

function tabIcon(route: keyof PatientTabParamList, color: string) {
  const map: Record<keyof PatientTabParamList, string> = {
    Home: 'home-outline',
    Book: 'calendar-outline',
    QueueStatus: 'time-outline',
    History: 'reader-outline',
    Reports: 'document-text-outline',
  };
  return <Ionicons name={map[route] as never} size={16} color={color} />;
}

export default function PatientMaterialTabs() {
  return (
    <Tab.Navigator
      style={styles.tabs}
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarShowIcon: true,
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: colors.slate500,
        tabBarIndicatorStyle: { backgroundColor: colors.primary600, height: 2 },
        tabBarStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.slate200,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarItemStyle: { width: 'auto', minWidth: 100 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => tabIcon('Home', color),
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookTab}
        options={{
          tabBarLabel: 'Book',
          tabBarIcon: ({ color }) => tabIcon('Book', color),
        }}
      />
      <Tab.Screen
        name="QueueStatus"
        component={StatusTab}
        options={{
          tabBarLabel: 'Queue Status',
          tabBarIcon: ({ color }) => tabIcon('QueueStatus', color),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryTab}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => tabIcon('History', color),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsTab}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color }) => tabIcon('Reports', color),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
});
