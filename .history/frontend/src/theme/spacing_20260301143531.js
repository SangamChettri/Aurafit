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
    xs: { padding: spacing.xs },
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
    xl: { padding: spacing.xl },
    '2xl': { padding: spacing['2xl'] },
    '3xl': { padding: spacing['3xl'] },
  },

  // Padding X (horizontal)
  paddingHorizontal: {
    xs: { paddingHorizontal: spacing.xs },
    sm: { paddingHorizontal: spacing.sm },
    md: { paddingHorizontal: spacing.md },
    lg: { paddingHorizontal: spacing.lg },
    xl: { paddingHorizontal: spacing.xl },
    '2xl': { paddingHorizontal: spacing['2xl'] },
    '3xl': { paddingHorizontal: spacing['3xl'] },
  },

  // Padding Y (vertical)
  paddingVertical: {
    xs: { paddingVertical: spacing.xs },
    sm: { paddingVertical: spacing.sm },
    md: { paddingVertical: spacing.md },
    lg: { paddingVertical: spacing.lg },
    xl: { paddingVertical: spacing.xl },
    '2xl': { paddingVertical: spacing['2xl'] },
    '3xl': { paddingVertical: spacing['3xl'] },
  },

  // Margin
  margin: {
    xs: { margin: spacing.xs },
    sm: { margin: spacing.sm },
    md: { margin: spacing.md },
    lg: { margin: spacing.lg },
    xl: { margin: spacing.xl },
    '2xl': { margin: spacing['2xl'] },
    '3xl': { margin: spacing['3xl'] },
    auto: { margin: 'auto' },
  },

  // Margin X (horizontal)
  marginHorizontal: {
    xs: { marginHorizontal: spacing.xs },
    sm: { marginHorizontal: spacing.sm },
    md: { marginHorizontal: spacing.md },
    lg: { marginHorizontal: spacing.lg },
    xl: { marginHorizontal: spacing.xl },
    '2xl': { marginHorizontal: spacing['2xl'] },
    '3xl': { marginHorizontal: spacing['3xl'] },
    auto: { marginHorizontal: 'auto' },
  },

  // Margin Y (vertical)
  marginVertical: {
    xs: { marginVertical: spacing.xs },
    sm: { marginVertical: spacing.sm },
    md: { marginVertical: spacing.md },
    lg: { marginVertical: spacing.lg },
    xl: { marginVertical: spacing.xl },
    '2xl': { marginVertical: spacing['2xl'] },
    '3xl': { marginVertical: spacing['3xl'] },
    auto: { marginVertical: 'auto' },
  },

  // Gap (for flexbox)
  gap: {
    xs: { gap: spacing.xs },
    sm: { gap: spacing.sm },
    md: { gap: spacing.md },
    lg: { gap: spacing.lg },
    xl: { gap: spacing.xl },
    '2xl': { gap: spacing['2xl'] },
    '3xl': { gap: spacing['3xl'] },
  },

  // Row Gap
  rowGap: {
    xs: { rowGap: spacing.xs },
    sm: { rowGap: spacing.sm },
    md: { rowGap: spacing.md },
    lg: { rowGap: spacing.lg },
    xl: { rowGap: spacing.xl },
    '2xl': { rowGap: spacing['2xl'] },
    '3xl': { rowGap: spacing['3xl'] },
  },

  // Column Gap
  columnGap: {
    xs: { columnGap: spacing.xs },
    sm: { columnGap: spacing.sm },
    md: { columnGap: spacing.md },
    lg: { columnGap: spacing.lg },
    xl: { columnGap: spacing.xl },
    '2xl': { columnGap: spacing['2xl'] },
    '3xl': { columnGap: spacing['3xl'] },
  },

  // Layout Spacing
  container: {
    padding: spacing.lg,
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },

  section: {
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },

  card: {
    padding: spacing.lg,
    borderRadius: spacing.lg,
  },

  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.md,
  },

  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
  },

  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
  },

  // Screen-specific spacing
  screen: {
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing['3xl'],
  },

  content: {
    padding: spacing.lg,
  },

  footer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },

  // Navigation spacing
  tabBar: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 80,
  },

  headerHeight: 60,
  tabBarHeight: 80,

  // Component spacing presets
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
  },

  statCard: {
    padding: spacing.lg,
    borderRadius: spacing.lg,
    margin: spacing.sm,
  },

  form: {
    gap: spacing.lg,
    padding: spacing.lg,
  },

  formField: {
    marginBottom: spacing.lg,
  },

  // Responsive spacing
  responsive: {
    small: {
      padding: spacing.md,
      margin: spacing.sm,
      gap: spacing.sm,
    },
    medium: {
      padding: spacing.lg,
      margin: spacing.md,
      gap: spacing.md,
    },
    large: {
      padding: spacing.xl,
      margin: spacing.lg,
      gap: spacing.lg,
    },
  },

  // Utility functions
  createSpacing: (value) => spacing[value] || value,
  
  multiply: (base, multiplier) => base * multiplier,
  
  add: (...values) => values.reduce((sum, val) => sum + (spacing[val] || val), 0),
};

export default spacing;
