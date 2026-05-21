// Test workout API endpoint
const axios = require('axios');

async function testWorkoutAPI() {
  try {
    console.log('🧪 Testing workout API endpoint...');
    
    // Test the API endpoint
    const response = await axios.get('http://localhost:5000/api/workouts', {
      headers: {
        'Content-Type': 'application/json',
        // Note: You would need a valid token here for actual testing
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data Structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasWorkouts: !!response.data.data?.workouts,
      workoutsCount: response.data.data?.workouts?.length || 0
    });
    
    if (response.data.success && response.data.data?.workouts) {
      console.log('📋 Sample workout data:', response.data.data.workouts[0]);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

console.log('🚀 Starting workout API test...');
testWorkoutAPI();

module.exports = {};
