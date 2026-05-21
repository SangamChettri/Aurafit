/**
 * AuraFit Color Theme
 * Professional dark mode fitness app color palette
 */

const colors = {
  // Primary Colors
  primary: '#6366f1',        // Electric indigo
  primaryDark: '#4f46e5',    // Darker indigo
  primaryLight: '#818cf8',   // Lighter indigo
  
  // Secondary Colors
  secondary: '#64748b',      // Soft gray
  secondaryDark: '#475569',  // Darker gray
  secondaryLight: '#94a3b8', // Lighter gray
  
  // Background Colors
  background: '#0f172a',     // Deep dark blue
  backgroundSecondary: '#1e293b', // Lighter dark blue
  backgroundTertiary: '#334155', // Even lighter dark blue
  
  // Surface Colors
  surface: '#1e293b',        // Card background
  surfaceVariant: '#334155', // Variant surface
  surfaceHover: '#475569',   // Hover state
  
  // Accent Colors
  success: '#10b981',        // Green for progress/success
  successLight: '#34d399',   // Light green
  warning: '#f59e0b',        // Amber for warnings
  warningLight: '#fbbf24',   // Light amber
  error: '#ef4444',          // Red for errors/danger
  errorLight: '#f87171',     // Light red
  info: '#3b82f6',           // Blue for info
  
  // Text Colors
  text: '#f8fafc',           // Primary text
  textSecondary: '#e2e8f0',  // Secondary text
  textTertiary: '#94a3b8',   // Tertiary text
  textInverse: '#0f172a',    // Inverted text
  
  // Border Colors
  border: '#334155',         // Default border
  borderLight: '#475569',    // Light border
  borderDark: '#1e293b',     // Dark border
  
  // Gradient Colors
  gradientPrimary: ['#6366f1', '#8b5cf6'], // Primary gradient
  gradientSuccess: ['#10b981', '#34d399'], // Success gradient
  gradientWarning: ['#f59e0b', '#fbbf24'], // Warning gradient
  gradientError: ['#ef4444', '#f87171'],   // Error gradient
  gradientBackground: ['#0f172a', '#1e293b'], // Background gradient
  
  // Tab Bar Colors
  tabBar: '#1e293b',         // Tab bar background
  tabBarActive: '#6366f1',   // Active tab color
  tabBarInactive: '#64748b', // Inactive tab color
  
  // Status Colors
  online: '#10b981',         // Online status
  offline: '#64748b',        // Offline status
  premium: '#f59e0b',        // Premium status
  
  // Chart Colors
  chart: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    grid: '#334155',
    text: '#e2e8f0',
  },
  
  // Shadow Colors (for dark theme)
  shadow: {
    sm: 'rgba(0, 0, 0, 0.1)',
    md: 'rgba(0, 0, 0, 0.2)',
    lg: 'rgba(0, 0, 0, 0.3)',
    xl: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Input Colors
  input: {
    background: '#334155',
    border: '#475569',
    borderFocus: '#6366f1',
    text: '#f8fafc',
    placeholder: '#94a3b8',
  },
  
  // Button Colors
  button: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    secondary: '#334155',
    secondaryHover: '#475569',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#10b981',
    successHover: '#059669',
    text: '#f8fafc',
    textSecondary: '#e2e8f0',
  },
  
  // Card Colors
  card: {
    background: '#1e293b',
    backgroundHover: '#334155',
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.2)',
  },
};

export default colors;
