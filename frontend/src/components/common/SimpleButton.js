import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import theme from '../../theme';

/**
 * Simple Button Component (Fallback for LinearGradient issues)
 */
const SimpleButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.buttonPrimary;
      case 'success':
        return styles.buttonSuccess;
      case 'warning':
        return styles.buttonWarning;
      case 'error':
        return styles.buttonError;
      case 'secondary':
        return styles.buttonSecondary;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      variant === 'secondary' && styles.textSecondary,
      size === 'sm' && styles.textSmall,
      size === 'lg' && styles.textLarge,
      textStyle,
    ];

    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.content}>
          <ActivityIndicator
            size="small"
            color={variant === 'secondary' ? theme.colors.text : theme.colors.button.text}
          />
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      );
    }

    const renderIcon = () => {
      if (!icon) return null;
      return <Text style={[styles.icon, getTextStyle()]}>{icon}</Text>;
    };

    return (
      <View style={styles.content}>
        {icon && iconPosition === 'left' && renderIcon()}
        <Text style={getTextStyle()}>{title}</Text>
        {icon && iconPosition === 'right' && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSuccess: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonWarning: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonError: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    ...theme.typography.button,
    color: theme.colors.button.text,
    textAlign: 'center',
  },
  textSecondary: {
    color: theme.colors.text,
  },
  textSmall: {
    ...theme.typography.buttonSmall,
  },
  textLarge: {
    fontSize: 18,
    lineHeight: 22,
  },
  icon: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default SimpleButton;
