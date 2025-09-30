#!/usr/bin/env node

/**
 * CeedPods API Integration Test Script
 * Tests the authentication flow with the actual CeedPods API
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5147';
const API_VERSION = 'v1';

// Test data
const TEST_USER = {
  name: 'Integration Test User',
  email: `test.${Date.now()}@example.com`, // Unique email
  password: 'TestPassword123',
  company: 'Test Company',
  phone: '+1234567890',
  role: 'SalesRep'
};

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  console.log(`📊 Status: ${response.status} ${response.statusText}`);
  console.log(`📄 Response:`, JSON.stringify(data, null, 2));
  
  return { response, data };
}

/**
 * Test user registration
 */
async function testRegistration() {
  console.log('\n🔐 Testing User Registration...');
  
  try {
    const { response, data } = await apiRequest(`/api/${API_VERSION}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });
    
    if (response.ok && data.success) {
      console.log('✅ Registration successful');
      return {
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        user: data.data.user
      };
    } else {
      console.error('❌ Registration failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return null;
  }
}

/**
 * Test user login
 */
async function testLogin() {
  console.log('\n🔐 Testing User Login...');
  
  try {
    const { response, data } = await apiRequest(`/api/${API_VERSION}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        rememberMe: false
      })
    });
    
    if (response.ok && data.success) {
      console.log('✅ Login successful');
      return {
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        user: data.data.user
      };
    } else {
      console.error('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

/**
 * Test password reset request
 */
async function testPasswordReset() {
  console.log('\n🔐 Testing Password Reset...');
  
  try {
    const { response, data } = await apiRequest(`/api/${API_VERSION}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_USER.email
      })
    });
    
    if (response.ok && data.success) {
      console.log('✅ Password reset request successful');
      return true;
    } else {
      console.error('❌ Password reset failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    return false;
  }
}

/**
 * Test token refresh
 */
async function testTokenRefresh(refreshToken) {
  console.log('\n🔐 Testing Token Refresh...');
  
  try {
    const { response, data } = await apiRequest(`/api/${API_VERSION}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });
    
    if (response.ok && data.success) {
      console.log('✅ Token refresh successful');
      return {
        token: data.data.token,
        refreshToken: data.data.refreshToken
      };
    } else {
      console.error('❌ Token refresh failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    return null;
  }
}

/**
 * Test logout
 */
async function testLogout(token) {
  console.log('\n🔐 Testing Logout...');
  
  try {
    const { response, data } = await apiRequest(`/api/${API_VERSION}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    
    if (response.ok && data.success) {
      console.log('✅ Logout successful');
      return true;
    } else {
      console.error('❌ Logout failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runIntegrationTests() {
  console.log('🚀 Starting CeedPods API Integration Tests...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`📍 Test User Email: ${TEST_USER.email}`);
  
  let testResults = {
    registration: false,
    login: false,
    passwordReset: false,
    tokenRefresh: false,
    logout: false
  };
  
  // Test 1: Registration
  const registrationResult = await testRegistration();
  testResults.registration = !!registrationResult;
  
  if (!registrationResult) {
    console.log('\n❌ Registration failed, stopping tests');
    return testResults;
  }
  
  // Test 2: Login  
  const loginResult = await testLogin();
  testResults.login = !!loginResult;
  
  if (!loginResult) {
    console.log('\n❌ Login failed, continuing with registration token');
  }
  
  // Use login result if available, otherwise use registration result
  const authData = loginResult || registrationResult;
  
  // Test 3: Password Reset
  testResults.passwordReset = await testPasswordReset();
  
  // Test 4: Token Refresh
  const refreshResult = await testTokenRefresh(authData.refreshToken);
  testResults.tokenRefresh = !!refreshResult;
  
  // Test 5: Logout
  const tokenToUse = refreshResult ? refreshResult.token : authData.token;
  testResults.logout = await testLogout(tokenToUse);
  
  // Print test summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(testResults).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(testResults).filter(r => r).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! CeedPods API integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above for details.');
  }
  
  return testResults;
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(console.error);
}

export { runIntegrationTests };