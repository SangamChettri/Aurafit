import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/progress/DashboardScreen';
import WorkoutHistoryScreen from '../screens/workout/WorkoutHistoryScreen';
import WorkoutFormScreen from '../screens/workout/WorkoutFormScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Context
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator for authenticated users
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Workouts') {
            iconName = 'fitness-center';
          } else if (route.name === 'Progress') {
            iconName = 'trending-up';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'AuraFit Dashboard',
        }}
      />
      
      <Tab.Screen
        name="Workouts"
        component={WorkoutHistoryScreen}
        options={{
          title: 'Workouts',
          headerTitle: 'Workout History',
        }}
      />
      
      <Tab.Screen
        name="Progress"
        component={DashboardScreen}
        options={{
          title: 'Progress',
          headerTitle: 'Your Progress',
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Workout Stack Navigator
 */
const WorkoutStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="WorkoutList"
        component={WorkoutHistoryScreen}
        options={{
          title: 'Workouts',
          headerShown: false, // Hidden because it's in tab navigator
        }}
      />
      
      <Stack.Screen
        name="WorkoutForm"
        component={WorkoutFormScreen}
        options={{
          title: 'Add Workout',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutFormScreen}
        options={{
          title: 'Workout Details',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Auth Stack Navigator for unauthenticated users
 */
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Welcome Back',
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Main App Navigator
 */
const AppNavigator = () => {
  const { isAuthenticated, isLoading, checkAuthSession } = useAuth();

  // Check authentication status on app start
  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

/**
 * Loading Screen Component
 */
const LoadingScreen = () => {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.content}>
        <Text style={loadingStyles.logo}>AuraFit</Text>
        <Text style={loadingStyles.tagline}>Transform Your Fitness Journey</Text>
        <ActivityIndicator size="large" color="#3b82f6" style={loadingStyles.spinner} />
        <Text style={loadingStyles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

const loadingStyles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
};

export default AppNavigator;
