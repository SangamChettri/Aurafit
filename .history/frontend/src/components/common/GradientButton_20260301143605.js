import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../../theme';

/**
 * Professional Gradient Button Component
 * Supports different variants and loading states
 */
const GradientButton = ({
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
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.gradientPrimary;
      case 'success':
        return theme.colors.gradientSuccess;
      case 'warning':
        return theme.colors.gradientWarning;
      case 'error':
        return theme.colors.gradientError;
      case 'secondary':
        return [theme.colors.surface, theme.colors.surfaceVariant];
      default:
        return theme.colors.gradientPrimary;
    }
  };

  const getButtonStyle = () => {
    switch (size) {
      case 'sm':
        return styles.buttonSmall;
      case 'lg':
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
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
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          disabled && styles.gradientDisabled,
        ]}
      >
        {renderContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  gradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  buttonSmall: {
    minHeight: 36,
  },
  buttonMedium: {
    minHeight: 48,
  },
  buttonLarge: {
    minHeight: 56,
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

export default GradientButton;
