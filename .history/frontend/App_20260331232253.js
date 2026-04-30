import React from 'react';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/theme';

/**
 * Main App Component with font loading
 */
const App = () => {
  console.log('🚀 App component rendering...');
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
