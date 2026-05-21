/**
 * AuraFit Theme System
 * Centralized theme exports for the fitness app
 */

import colors from './colors';
import typography from './typography';
import spacing from './spacing';
import shadows from './shadows';

const theme = {
  colors,
  typography,
  spacing,
  shadows,
  
  // Breakpoints for responsive design
  breakpoints: {
    small: 375,   // iPhone SE
    medium: 414,  // iPhone Pro
    large: 768,   // iPad Mini
    xlarge: 1024, // iPad
  },
  
  // Border radius values
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    full: 9999,
  },
  
  // Z-index values
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
  },
  
  // Transition easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default theme;
