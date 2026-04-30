import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../../theme';

/**
 * Professional Loading Overlay Component
 * Full-screen loading with gradient background
 */
const LoadingOverlay = ({
  visible = false,
  text = 'Loading...',
  subtext,
  showProgress = false,
  progress = 0,
  cancellable = false,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={theme.colors.gradientBackground}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={styles.spinner}
              />
              
              <Text style={styles.text}>{text}</Text>
              
              {subtext && (
                <Text style={styles.subtext}>{subtext}</Text>
              )}
              
              {showProgress && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(Math.max(progress, 0), 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(progress)}%
                  </Text>
                </View>
              )}
              
              {cancellable && onCancel && (
                <Text style={styles.cancelButton} onPress={onCancel}>
                  Cancel
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    minWidth: 200,
    maxWidth: '80%',
    ...theme.shadows.xl,
  },
  spinner: {
    marginBottom: theme.spacing.lg,
  },
  text: {
    ...theme.typography.h6,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtext: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    ...theme.typography.button,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
});

export default LoadingOverlay;
