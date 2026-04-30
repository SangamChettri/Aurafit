require('dotenv').config();

// Test creating an exercise
async function testCreateExercise() {
  try {
    console.log('🔍 Testing create exercise endpoint...');
    
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@aurafit.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login error:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('🔑 Got token');

    // Test creating an exercise
    const createResponse = await fetch('http://localhost:5000/api/admin/exercise-library/manage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Exercise',
        category: 'Bodyweight',
        muscleGroup: 'Chest',
        equipment: 'None',
        instructions: 'Test instructions'
      })
    });

    console.log('📝 Create response status:', createResponse.status);
    
    const createData = await createResponse.json();
    console.log('📝 Create response:', createData);

    if (createData.success) {
      console.log('✅ Exercise created successfully!');
      console.log(`🏋️ Exercise: ${createData.data.name} (ID: ${createData.data.id})`);
    } else {
      console.log('❌ Create failed:', createData.message);
      if (createData.errors) {
        createData.errors.forEach(err => console.log(`  - ${err.field}: ${err.message}`));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCreateExercise();
