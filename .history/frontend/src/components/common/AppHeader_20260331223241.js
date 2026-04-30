import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

/**
 * Professional App Header Component
 * Gradient header with title and optional actions
 */
const AppHeader = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  showBack = false,
  onBackPress,
  gradient = true,
  style,
  ...props
}) => {
  const renderLeftAction = () => {
    if (showBack) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBackPress}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      );
    }
    
    if (leftAction) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={leftAction.onPress}
        >
          <Ionicons 
            name={leftAction.icon} 
            size={20} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.actionPlaceholder} />;
  };

  const renderRightAction = () => {
    if (rightAction) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={rightAction.onPress}
        >
          <Ionicons 
            name={rightAction.icon} 
            size={20} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.actionPlaceholder} />;
  };

  const HeaderContent = () => (
    <View style={[styles.container, style]} {...props}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.content}>
        {renderLeftAction()}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {renderRightAction()}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <HeaderContent />
      </View>
    );
  }

  return <HeaderContent />;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPlaceholder: {
    width: 44,
  },
});

export default AppHeader;
