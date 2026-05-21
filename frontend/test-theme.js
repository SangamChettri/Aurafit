// Test theme system initialization
console.log('Testing theme system initialization...');

try {
  // Test importing the theme
  const theme = require('./src/theme/index.js');
  
  console.log('Theme system loaded successfully!');
  console.log('Available theme properties:');
  console.log('- Colors:', Object.keys(theme.colors).length, 'properties');
  console.log('- Typography:', Object.keys(theme.typography).length, 'properties');
  console.log('- Spacing:', Object.keys(theme.spacing).length, 'properties');
  console.log('- Shadows:', Object.keys(theme.shadows).length, 'properties');
  
  // Test specific properties
  console.log('\nTesting specific properties:');
  console.log('- Primary color:', theme.colors.primary);
  console.log('- Base font size:', theme.typography.base.fontSize);
  console.log('- Spacing md:', theme.spacing.md);
  console.log('- Shadow md:', theme.shadows.md);
  
  console.log('\nTheme system test passed! All properties accessible.');
  
} catch (error) {
  console.error('Theme system test failed:', error.message);
  console.error('Stack:', error.stack);
}

module.exports = {};
