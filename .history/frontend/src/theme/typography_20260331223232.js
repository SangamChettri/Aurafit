/**
 * AuraFit Typography System
 * Professional font hierarchy for fitness app
 */

import { Platform } from 'react-native';

const typography = {
  // Font Families
  fontFamily: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      default: 'monospace',
    }),
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Font Sizes - Increased for better readability
  fontSize: {
    xs: 14,      // Captions, labels (was 12)
    sm: 16,      // Small text, secondary info (was 14)
    base: 18,    // Body text, standard (was 16)
    lg: 20,      // Subheadings, important text (was 18)
    xl: 22,      // Small headings (was 20)
    '2xl': 26,   // Headings (was 24)
    '3xl': 32,   // Large headings (was 30)
    '4xl': 38,   // Hero headings (was 36)
    '5xl': 50,   // Display text (was 48)
    '6xl': 66,   // Large display (was 64)
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Text Styles - Updated with larger sizes
  h1: {
    fontFamily: 'SF Pro Display',
    fontSize: 38,  // was 36
    fontWeight: '700',
    lineHeight: 46, // was 44
    letterSpacing: -0.5,
    color: '#f8fafc',
  },

  h2: {
    fontFamily: 'SF Pro Display',
    fontSize: 32,  // was 30
    fontWeight: '700',
    lineHeight: 38, // was 36
    letterSpacing: -0.25,
    color: '#f8fafc',
  },

  h3: {
    fontFamily: 'SF Pro Display',
    fontSize: 26,  // was 24
    fontWeight: '600',
    lineHeight: 34, // was 32
    letterSpacing: 0,
    color: '#f8fafc',
  },

  h4: {
    fontFamily: 'SF Pro Display',
    fontSize: 22,  // was 20
    fontWeight: '600',
    lineHeight: 30, // was 28
    letterSpacing: 0,
    color: '#f8fafc',
  },

  h5: {
    fontFamily: 'SF Pro Display',
    fontSize: 20,  // was 18
    fontWeight: '600',
    lineHeight: 26, // was 24
    letterSpacing: 0,
    color: '#f8fafc',
  },

  h6: {
    fontFamily: 'SF Pro Display',
    fontSize: 18,  // was 16
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#f8fafc',
  },

  // Body Text - Updated with larger sizes
  body1: {
    fontFamily: 'SF Pro Text',
    fontSize: 18,  // was 16
    fontWeight: '400',
    lineHeight: 26, // was 24
    letterSpacing: 0,
    color: '#e2e8f0',
  },

  body2: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,  // was 14
    fontWeight: '400',
    lineHeight: 22, // was 20
    letterSpacing: 0,
    color: '#e2e8f0',
  },

  // Subtitle Text - Updated with larger sizes
  subtitle1: {
    fontFamily: 'SF Pro Text',
    fontSize: 18,  // was 16
    fontWeight: '500',
    lineHeight: 26, // was 24
    letterSpacing: 0.15,
    color: '#e2e8f0',
  },

  subtitle2: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,  // was 14
    fontWeight: '500',
    lineHeight: 22, // was 20
    letterSpacing: 0.1,
    color: '#e2e8f0',
  },

  // Caption and Overline - Updated with larger sizes
  caption: {
    fontFamily: 'SF Pro Text',
    fontSize: 14,  // was 12
    fontWeight: '400',
    lineHeight: 18, // was 16
    letterSpacing: 0.4,
    color: '#94a3b8',
  },

  overline: {
    fontFamily: 'SF Pro Text',
    fontSize: 12,  // was 10
    fontWeight: '600',
    lineHeight: 18, // was 16
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },

  // Button Text - Updated with larger sizes
  button: {
    fontFamily: 'SF Pro Display',
    fontSize: 18,  // was 16
    fontWeight: '600',
    lineHeight: 22, // was 20
    letterSpacing: 0.5,
    textTransform: 'none',
  },

  buttonSmall: {
    fontFamily: 'SF Pro Display',
    fontSize: 16,  // was 14
    fontWeight: '600',
    lineHeight: 20, // was 18
    letterSpacing: 0.25,
    textTransform: 'none',
  },

  // Input Text - Updated with larger sizes
  input: {
    fontFamily: 'SF Pro Text',
    fontSize: 18,  // was 16
    fontWeight: '400',
    lineHeight: 26, // was 24
    letterSpacing: 0,
    color: '#f8fafc',
  },

  // Label Text - Updated with larger sizes
  label: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,  // was 14
    fontWeight: '500',
    lineHeight: 22, // was 20
    letterSpacing: 0.1,
    color: '#e2e8f0',
  },

  // Tab Text - Updated with larger sizes
  tab: {
    fontFamily: 'SF Pro Display',
    fontSize: 14,  // was 12
    fontWeight: '500',
    lineHeight: 18, // was 16
    letterSpacing: 0.5,
    textTransform: 'none',
  },

  // Navigation Text - Updated with larger sizes
  navigation: {
    fontFamily: 'SF Pro Display',
    fontSize: 18,  // was 16
    fontWeight: '600',
    lineHeight: 22, // was 20
    letterSpacing: 0,
    color: '#f8fafc',
  },

  // Status Text - Updated with larger sizes
  success: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,  // was 14
    fontWeight: '500',
    lineHeight: 22, // was 20
    letterSpacing: 0.1,
    color: '#10b981',
  },

  warning: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,  // was 14
    fontWeight: '500',
    lineHeight: 22, // was 20
    letterSpacing: 0.1,
    color: '#f59e0b',
  },

  error: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,  // was 14
    fontWeight: '500',
    lineHeight: 22, // was 20
    letterSpacing: 0.1,
    color: '#ef4444',
  },

  // Special Text Styles - Updated with larger sizes
  gradient: {
    fontFamily: 'SF Pro Display',
    fontSize: 26,  // was 24
    fontWeight: '700',
    lineHeight: 34, // was 32
    letterSpacing: 0,
    // Gradient will be applied via component
  },

  mono: {
    fontFamily: 'SF Mono',
    fontSize: 16,  // was 14
    fontWeight: '400',
    lineHeight: 22, // was 20
    letterSpacing: 0,
    color: '#e2e8f0',
  },

  // Utility Functions
  createTextStyle: (baseStyle, customizations = {}) => ({
    ...baseStyle,
    ...customizations,
  }),

  // Responsive font sizes - Updated with larger base sizes
  responsive: {
    small: {
      h1: { fontSize: 30 },  // was 28
      h2: { fontSize: 26 },  // was 24
      h3: { fontSize: 22 },  // was 20
      body1: { fontSize: 16 }, // was 14
      body2: { fontSize: 14 }, // was 12
    },
    medium: {
      h1: { fontSize: 38 },  // was 36
      h2: { fontSize: 32 },  // was 30
      h3: { fontSize: 26 },  // was 24
      body1: { fontSize: 18 }, // was 16
      body2: { fontSize: 16 }, // was 14
    },
    large: {
      h1: { fontSize: 46 },  // was 44
      h2: { fontSize: 38 },  // was 36
      h3: { fontSize: 30 },  // was 28
      body1: { fontSize: 20 }, // was 18
      body2: { fontSize: 18 }, // was 16
    },
  },
};

export default typography;
