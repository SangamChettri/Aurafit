import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

/**
 * Custom Tab Bar Component
 * Professional floating tab bar with smooth animations
 */
const CustomTabBar = ({
  state,
  descriptors,
  navigation,
  activeTintColor = theme.colors.tabBarActive,
  inactiveTintColor = theme.colors.tabBarInactive,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const renderTab = (route, index) => {
    const { options } = descriptors[route.key];
    const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title;
    const isFocused = state.index === index;

    const getTabIcon = (routeName) => {
      const icons = {
        Dashboard: '🏠',
        Workouts: '🏋️',
        Progress: '📈',
        Streak: '🔥',
        Settings: '⚙️',
      };
      return icons[routeName] || '📱';
    };

    const getActiveIcon = (routeName) => {
      const icons = {
        Dashboard: '🏠',
        Workouts: '💪',
        Progress: '📊',
        Streak: '🔥',
        Settings: '⚙️',
      };
      return icons[routeName] || '📱';
    };

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    const tabStyle = [
      styles.tab,
      isFocused && styles.tabActive,
    ];

    const iconStyle = [
      styles.tabIcon,
      isFocused && styles.tabIconActive,
    ];

    const labelStyle = [
      styles.tabLabel,
      isFocused && styles.tabLabelActive,
    ];

    return (
      <TouchableOpacity
        key={route.key}
        style={tabStyle}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <Text style={iconStyle}>
            {isFocused ? getActiveIcon(route.name) : getTabIcon(route.name)}
          </Text>
          <Text style={labelStyle} numberOfLines={1}>
            {label}
          </Text>
        </View>
        
        {isFocused && (
          <View style={styles.activeIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        <View style={styles.gradientContainer}>
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => renderTab(route, index))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientContainer: {
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    position: 'relative',
  },
  tabActive: {
    // Active tab styling
  },
  tabContent: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tabIcon: {
    fontSize: 20,
    color: theme.colors.tabBarInactive,
  },
  tabIconActive: {
    color: theme.colors.tabBarActive,
  },
  tabLabel: {
    ...theme.typography.tab,
    color: theme.colors.tabBarInactive,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: theme.colors.tabBarActive,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -12 }],
    width: 24,
    height: 3,
    backgroundColor: theme.colors.tabBarActive,
    borderRadius: theme.borderRadius.sm,
  },
});

export default CustomTabBar;
