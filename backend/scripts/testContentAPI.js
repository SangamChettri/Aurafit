require('dotenv').config();

// Test content API endpoints
async function testContentAPI() {
  try {
    console.log('🔍 Testing content API endpoints...');
    
    // Test constants endpoint
    console.log('\n📋 Testing /api/content/constants...');
    const constantsResponse = await fetch('http://localhost:5000/api/content/constants');
    
    if (constantsResponse.ok) {
      const constantsData = await constantsResponse.json();
      console.log('✅ Constants endpoint working!');
      console.log('📊 Categories:', constantsData.data.categories.length);
      console.log('💪 Muscle groups:', constantsData.data.muscleGroups.length);
      console.log('🎯 Milestones:', constantsData.data.streakMilestones.length);
    } else {
      console.log('❌ Constants endpoint failed:', constantsResponse.status);
    }
    
    // Test inspiration endpoint
    console.log('\n💡 Testing /api/content/inspiration...');
    const inspirationResponse = await fetch('http://localhost:5000/api/content/inspiration');
    
    if (inspirationResponse.ok) {
      const inspirationData = await inspirationResponse.json();
      console.log('✅ Inspiration endpoint working!');
      console.log('📝 Quote:', inspirationData.data.title);
      console.log('📄 Text:', inspirationData.data.text.substring(0, 50) + '...');
      console.log('✍️ Author:', inspirationData.data.author);
    } else {
      console.log('❌ Inspiration endpoint failed:', inspirationResponse.status);
      const errorData = await inspirationResponse.text();
      console.log('Error details:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContentAPI();
