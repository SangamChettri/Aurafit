import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import theme from '../../theme';

/**
 * Stat Card Component
 * Displays statistics with icon, value, and label
 */
const StatCard = ({
  icon,
  value,
  label,
  subtitle,
  trend,
  variant = 'default',
  size = 'md',
  style,
  ...props
}) => {
  const getCardVariant = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          shadow: 'primary',
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          shadow: 'success',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          shadow: 'warning',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          shadow: 'error',
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          shadow: 'md',
        };
    }
  };

  const getCardSize = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'md',
        };
      case 'lg':
        return {
          padding: 'xl',
        };
      default:
        return {
          padding: 'lg',
        };
    }
  };

  const cardVariant = getCardVariant();
  const cardSize = getCardSize();

  const getValueStyle = () => {
    const baseStyle = [styles.value];
    
    if (variant !== 'default') {
      baseStyle.push(styles.valueLight);
    }
    
    if (size === 'sm') {
      baseStyle.push(styles.valueSmall);
    } else if (size === 'lg') {
      baseStyle.push(styles.valueLarge);
    }
    
    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.label];
    
    if (variant !== 'default') {
      baseStyle.push(styles.labelLight);
    }
    
    if (size === 'sm') {
      baseStyle.push(styles.labelSmall);
    }
    
    return baseStyle;
  };

  const renderTrend = () => {
    if (!trend) return null;

    const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️';
    const trendColor = trend > 0 ? theme.colors.success : 
                      trend < 0 ? theme.colors.error : 
                      theme.colors.textSecondary;

    return (
      <View style={styles.trendContainer}>
        <Text style={styles.trendIcon}>{trendIcon}</Text>
        <Text style={[styles.trendValue, { color: trendColor }]}>
          {Math.abs(trend)}%
        </Text>
      </View>
    );
  };

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: cardVariant.backgroundColor },
        style,
      ]}
      shadow={cardVariant.shadow}
      padding={cardSize.padding}
      {...props}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {icon && (
            <Text style={[
              styles.icon,
              variant !== 'default' && styles.iconLight
            ]}>
              {icon}
            </Text>
          )}
          {renderTrend()}
        </View>
        
        <Text style={getValueStyle()}>{value}</Text>
        <Text style={getLabelStyle()}>{label}</Text>
        
        {subtitle && (
          <Text style={[
            styles.subtitle,
            variant !== 'default' && styles.subtitleLight
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  iconLight: {
    color: theme.colors.text,
  },
  value: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  valueSmall: {
    ...theme.typography.h4,
  },
  valueLarge: {
    ...theme.typography.h2,
  },
  valueLight: {
    color: theme.colors.text,
  },
  label: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  labelSmall: {
    ...theme.typography.caption,
  },
  labelLight: {
    color: theme.colors.textInverse,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  subtitleLight: {
    color: theme.colors.textInverse,
    opacity: 0.8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  trendIcon: {
    fontSize: 14,
  },
  trendValue: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});

export default StatCard;
