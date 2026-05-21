import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigator from './TabNavigator';

// Context
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/common/LoadingOverlay';
import theme from '../theme';

// Create stack navigator
const Stack = createNativeStackNavigator();

/**
 * Auth Stack Navigator for unauthenticated users
 */
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          ...theme.typography.h5,
          color: theme.colors.text,
        },
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
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
    return <LoadingOverlay visible={true} text="Loading AuraFit..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
