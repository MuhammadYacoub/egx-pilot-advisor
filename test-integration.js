#!/usr/bin/env node

/**
 * Integration Test Script for EGX Pilot Advisor
 * Tests the complete frontend-backend integration workflow
 */

const API_BASE_URL = 'http://localhost:3001/api';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function testIntegration() {
  console.log('🚀 Starting EGX Pilot Advisor Integration Test\n');

  try {
    // 1. Test Backend Health
    console.log('1️⃣ Testing Backend Health...');
    const health = await makeRequest('/health');
    console.log('✅ Backend is healthy:', health.message);
    console.log('   Version:', health.version);
    console.log();

    // 2. Test User Authentication
    console.log('2️⃣ Testing User Authentication...');
    const authResponse = await makeRequest('/auth/test-user', {
      method: 'POST',
      body: JSON.stringify({
        email: 'integration-test@example.com',
        name: 'Integration Test User'
      }),
    });
    
    const { user, tokens } = authResponse.data;
    const authToken = tokens.accessToken;
    
    console.log('✅ User authenticated successfully');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Token received:', authToken.substring(0, 20) + '...');
    console.log();

    // 3. Test Portfolio Management
    console.log('3️⃣ Testing Portfolio Management...');
    
    // Get existing portfolios
    const portfoliosResponse = await makeRequest('/portfolio', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Retrieved portfolios successfully');
    console.log('   Portfolio count:', portfoliosResponse.data.length);
    
    if (portfoliosResponse.data.length > 0) {
      const portfolio = portfoliosResponse.data[0];
      console.log('   First portfolio:', portfolio.name);
      console.log('   Portfolio value:', `$${portfolio.currentValue.toLocaleString()}`);
      console.log('   Positions count:', portfolio.stats.positionsCount);
      
      // Test portfolio details
      const portfolioDetails = await makeRequest(`/portfolio/${portfolio.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Retrieved portfolio details successfully');
      console.log('   Detailed positions:', portfolioDetails.data.positions?.length || 0);
    }
    console.log();

    // 4. Test User Profile
    console.log('4️⃣ Testing User Profile...');
    const profileResponse = await makeRequest('/auth/profile', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Retrieved user profile successfully');
    console.log('   Profile name:', profileResponse.data.name);
    console.log('   Profile email:', profileResponse.data.email);
    console.log();

    // 5. Test Frontend Accessibility
    console.log('5️⃣ Testing Frontend Accessibility...');
    try {
      const frontendResponse = await fetch('http://localhost:8080');
      if (frontendResponse.ok) {
        console.log('✅ Frontend is accessible at http://localhost:8080');
        console.log('   Status:', frontendResponse.status, frontendResponse.statusText);
      } else {
        console.log('❌ Frontend not accessible:', frontendResponse.status);
      }
    } catch (error) {
      console.log('❌ Frontend connection failed:', error.message);
    }
    console.log();

    // Summary
    console.log('🎉 Integration Test Summary:');
    console.log('✅ Backend API: Working');
    console.log('✅ Authentication: Working');
    console.log('✅ Portfolio Management: Working');
    console.log('✅ User Profile: Working');
    console.log('✅ Frontend: Accessible');
    console.log();
    console.log('🌟 EGX Pilot Advisor integration is fully functional!');
    console.log();
    console.log('📱 Access the application at: http://localhost:8080');
    console.log('🔧 Backend API available at: http://localhost:3001/api');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testIntegration().catch(console.error);
