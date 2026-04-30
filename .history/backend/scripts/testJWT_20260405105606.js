require('dotenv').config();
const jwt = require('jsonwebtoken');

// Test JWT token generation and verification
function testJWT() {
  console.log('🔧 Testing JWT token generation and verification...');
  
  // Check environment variables
  console.log('📋 Environment variables:');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE || '7d');
  
  if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET is not set in environment variables!');
    return;
  }

  try {
    // Generate token
    const testUserId = 1;
    const token = jwt.sign(
      { id: testUserId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    console.log('✅ Token generated successfully:');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully:');
    console.log('Decoded:', decoded);
    
    // Test expiration
    const expDate = new Date(decoded.exp * 1000);
    console.log('📅 Token expires at:', expDate.toISOString());
    console.log('📅 Current time:', new Date().toISOString());
    
    if (expDate > new Date()) {
      console.log('✅ Token is still valid');
    } else {
      console.log('❌ Token has expired');
    }
    
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
  }
}

testJWT();
