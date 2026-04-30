/**
 * AuraFit Spacing System
 * Consistent spacing and sizing for professional layout
 */

const spacing = {
  // Base spacing unit (4px)
  unit: 4,

  // Spacing Scale
  xs: 4,      // 0.25rem - Extra small spacing
  sm: 8,      // 0.5rem  - Small spacing
  md: 12,     // 0.75rem - Medium spacing
  lg: 16,     // 1rem    - Large spacing
  xl: 20,     // 1.25rem - Extra large spacing
  '2xl': 24, // 1.5rem  - 2x large
  '3xl': 32, // 2rem    - 3x large
  '4xl': 40, // 2.5rem  - 4x large
  '5xl': 48, // 3rem    - 5x large
  '6xl': 56, // 3.5rem  - 6x large
  '7xl': 64, // 4rem    - 7x large
  '8xl': 72, // 4.5rem  - 8x large
  '9xl': 80, // 5rem    - 9x large
  '10xl': 96, // 6rem   - 10x large
  '11xl': 112, // 7rem  - 11x large
  '12xl': 128, // 8rem  - 12x large

  // Component-specific spacing
  // Padding
  padding: {
    xs: { padding: 4 },
    sm: { padding: 8 },
    md: { padding: 12 },
    lg: { padding: 16 },
    xl: { padding: 20 },
    '2xl': { padding: 24 },
    '3xl': { padding: 32 },
  },

  // Padding X (horizontal)
  paddingHorizontal: {
    xs: { paddingHorizontal: 4 },
    sm: { paddingHorizontal: 8 },
    md: { paddingHorizontal: 12 },
    lg: { paddingHorizontal: 16 },
    xl: { paddingHorizontal: 20 },
    '2xl': { paddingHorizontal: 24 },
    '3xl': { paddingHorizontal: 32 },
  },

  // Padding Y (vertical)
  paddingVertical: {
    xs: { paddingVertical: 4 },
    sm: { paddingVertical: 8 },
    md: { paddingVertical: 12 },
    lg: { paddingVertical: 16 },
    xl: { paddingVertical: 20 },
    '2xl': { paddingVertical: 24 },
    '3xl': { paddingVertical: 32 },
  },

  // Margin
  margin: {
    xs: { margin: 4 },
    sm: { margin: 8 },
    md: { margin: 12 },
    lg: { margin: 16 },
    xl: { margin: 20 },
    '2xl': { margin: 24 },
    '3xl': { margin: 32 },
    auto: { margin: 'auto' },
  },

  // Margin X (horizontal)
  marginHorizontal: {
    xs: { marginHorizontal: 4 },
    sm: { marginHorizontal: 8 },
    md: { marginHorizontal: 12 },
    lg: { marginHorizontal: 16 },
    xl: { marginHorizontal: 20 },
    '2xl': { marginHorizontal: 24 },
    '3xl': { marginHorizontal: 32 },
    auto: { marginHorizontal: 'auto' },
  },

  // Margin Y (vertical)
  marginVertical: {
    xs: { marginVertical: 4 },
    sm: { marginVertical: 8 },
    md: { marginVertical: 12 },
    lg: { marginVertical: 16 },
    xl: { marginVertical: 20 },
    '2xl': { marginVertical: 24 },
    '3xl': { marginVertical: 32 },
    auto: { marginVertical: 'auto' },
  },

  // Gap (for flexbox)
  gap: {
    xs: { gap: 4 },
    sm: { gap: 8 },
    md: { gap: 12 },
    lg: { gap: 16 },
    xl: { gap: 20 },
    '2xl': { gap: 24 },
    '3xl': { gap: 32 },
  },

  // Row Gap
  rowGap: {
    xs: { rowGap: 4 },
    sm: { rowGap: 8 },
    md: { rowGap: 12 },
    lg: { rowGap: 16 },
    xl: { rowGap: 20 },
    '2xl': { rowGap: 24 },
    '3xl': { rowGap: 32 },
  },

  // Column Gap
  columnGap: {
    xs: { columnGap: 4 },
    sm: { columnGap: 8 },
    md: { columnGap: 12 },
    lg: { columnGap: 16 },
    xl: { columnGap: 20 },
    '2xl': { columnGap: 24 },
    '3xl': { columnGap: 32 },
  },

  // Layout Spacing
  container: {
    padding: 16,
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },

  section: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },

  card: {
    padding: 16,
    borderRadius: 16,
  },

  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  // Screen-specific spacing
  screen: {
    padding: 16,
    paddingTop: 24,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 32,
  },

  content: {
    padding: 16,
  },

  footer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Navigation spacing
  tabBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 80,
  },

  headerHeight: 60,
  tabBarHeight: 80,

  // Component spacing presets
  list: {
    padding: 16,
    gap: 12,
  },

  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },

  statCard: {
    padding: 16,
    borderRadius: 16,
    margin: 8,
  },

  form: {
    gap: 16,
    padding: 16,
  },

  formField: {
    marginBottom: 16,
  },

  // Responsive spacing
  responsive: {
    small: {
      padding: 12,
      margin: 8,
      gap: 8,
    },
    medium: {
      padding: 16,
      margin: 12,
      gap: 12,
    },
    large: {
      padding: 20,
      margin: 16,
      gap: 16,
    },
  },

  // Utility functions
  createSpacing: (value) => spacing[value] || value,
  
  multiply: (base, multiplier) => base * multiplier,
  
  add: (...values) => values.reduce((sum, val) => sum + (spacing[val] || val), 0),
};

export default spacing;
