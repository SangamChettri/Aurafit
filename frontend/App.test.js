import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Simple test app to check if basic React Native works
 */
const TestApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AuraFit Test</Text>
      <Text style={styles.subtitle}>Basic React Native Working!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
});

export default TestApp;
