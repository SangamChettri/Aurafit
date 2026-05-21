import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/common';

// Import screens
import DashboardScreen from '../screens/progress/DashboardScreen';
import WorkoutHistoryScreen from '../screens/workout/WorkoutHistoryScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import StreakScreen from '../screens/streak/StreakScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

/**
 * Professional Tab Navigator
 * Uses custom tab bar with premium design
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        unmountOnBlur: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />
      
      <Tab.Screen
        name="Workouts"
        component={WorkoutHistoryScreen}
        options={{
          tabBarLabel: 'Workouts',
          title: 'Workouts',
        }}
      />
      
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          title: 'Progress',
        }}
      />
      
      <Tab.Screen
        name="Streak"
        component={StreakScreen}
        options={{
          tabBarLabel: 'Streak',
          title: 'Streak',
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
