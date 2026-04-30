require('dotenv').config();

// Test exercises API endpoints
async function testExercisesAPI() {
  try {
    console.log('🔍 Testing exercises API endpoints...');
    
    // Test GET /exercises (all exercises)
    console.log('\n🏋️ Testing GET /exercises...');
    const exercisesResponse = await fetch('http://localhost:5000/api/admin/exercises');
    
    if (exercisesResponse.ok) {
      const exercisesData = await exercisesResponse.json();
      console.log('✅ Exercises endpoint working!');
      console.log('📊 Exercise count:', exercisesData.data.length);
      console.log('🏋️ First exercise:', exercisesData.data[0]?.name);
    } else {
      console.log('❌ Exercises endpoint failed:', exercisesResponse.status);
      const errorData = await exercisesResponse.text();
      console.log('Error details:', errorData);
    }
    
    // Test GET /exercises with search
    console.log('\n🔍 Testing GET /exercises?search=bench...');
    const searchResponse = await fetch('http://localhost:5000/api/admin/exercises?search=bench');
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Search endpoint working!');
      console.log('📊 Search results:', searchData.data.length);
      if (searchData.data.length > 0) {
        console.log('🏋️ Found:', searchData.data[0].name);
      }
    } else {
      console.log('❌ Search endpoint failed:', searchResponse.status);
    }
    
    // Test GET /exercises/:id
    console.log('\n🔍 Testing GET /exercises/1...');
    const singleResponse = await fetch('http://localhost:5000/api/admin/exercises/1');
    
    if (singleResponse.ok) {
      const singleData = await singleResponse.json();
      console.log('✅ Single exercise endpoint working!');
      console.log('🏋️ Exercise:', singleData.data.name);
      console.log('💪 Category:', singleData.data.category);
    } else {
      console.log('❌ Single exercise endpoint failed:', singleResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExercisesAPI();
