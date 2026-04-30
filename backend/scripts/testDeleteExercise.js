require('dotenv').config();

// Test deleting an exercise
async function testDeleteExercise() {
  try {
    console.log('🔍 Testing delete exercise endpoint...');
    
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

    // Test deleting the exercise we just created (ID: 16)
    const deleteResponse = await fetch('http://localhost:5000/api/admin/exercise-library/manage/16', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🗑️ Delete response status:', deleteResponse.status);
    
    const deleteData = await deleteResponse.json();
    console.log('🗑️ Delete response:', deleteData);

    if (deleteData.success) {
      console.log('✅ Exercise deleted successfully!');
      console.log(`🏋️ Deleted exercise: ${deleteData.data.name}`);
    } else {
      console.log('❌ Delete failed:', deleteData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeleteExercise();
