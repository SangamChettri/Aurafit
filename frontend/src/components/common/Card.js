import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../theme';

/**
 * Reusable Card Component
 * Professional card with shadow and styling options
 */
const Card = ({
  children,
  style,
  shadow = 'md',
  radius = 'lg',
  padding = 'lg',
  backgroundColor = theme.colors.surface,
  onPress,
  onLongPress,
  disabled = false,
  hoverable = false,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    theme.shadows[shadow],
    {
      backgroundColor,
      borderRadius: theme.borderRadius[radius],
      padding: theme.spacing[padding],
    },
    hoverable && styles.hoverable,
    onPress && styles.pressable,
    disabled && styles.disabled,
    style,
  ];

  const CardComponent = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={cardStyle}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.8 : 1}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  hoverable: {
    // Hover effect will be handled by animation
  },
  pressable: {
    // Touch feedback
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Card;
