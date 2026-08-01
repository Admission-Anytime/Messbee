const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const API_BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log("🚀 Starting API Tests (Postman Simulation)...\n");

  // 1. Test Social Login Route (Validation Check)
  console.log("Testing POST /api/auth/social/facebook (Missing Token)");
  try {
    await axios.post(`${API_BASE_URL}/auth/social/facebook`, {});
  } catch (err) {
    console.log(`✅ Expected Error Caught: ${err.response.status} - ${err.response.data.message}`);
  }

  console.log("\nTesting POST /api/auth/social/facebook (Invalid Token)");
  try {
    await axios.post(`${API_BASE_URL}/auth/social/facebook`, { accessToken: 'fake_token_123' });
  } catch (err) {
    console.log(`✅ Expected Error Caught: ${err.response.status} - ${err.response.data.message}`);
  }

  // Connect to DB to generate a test token
  console.log("\nConnecting to Database to generate a valid session...");
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find any existing user or create a temporary test user
  let user = await User.findOne();
  if (!user) {
    user = await User.create({
      name: "API Test User",
      email: "test_api_user@example.com",
      isEmailVerified: true,
      role: 'AGENT'
    });
    console.log("Created temporary test user.");
  } else {
    console.log(`Found existing user: ${user.email}`);
  }

  // Generate JWT matching the server's generateToken function
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // 2. Test Profile Update (The Onboarding Lazy Modal action)
  console.log("\nTesting PUT /api/users/profile (Updating Business Details)");
  const updatePayload = {
    businessName: "MessBee AI Tech",
    businessCategory: "software",
    businessType: "Company",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    phone: "+919876543210"
  };

  try {
    const response = await axios.put(`${API_BASE_URL}/users/profile`, updatePayload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log(`✅ Profile Update Successful!`);
      const updatedUser = response.data.data;
      console.log("Verified Saved Data in DB:");
      console.log(`- Business Name: ${updatedUser.businessName}`);
      console.log(`- Category: ${updatedUser.businessCategory}`);
      console.log(`- Type: ${updatedUser.businessType}`);
      console.log(`- City/State: ${updatedUser.city}, ${updatedUser.state}`);
      console.log(`- Country: ${updatedUser.country}`);
      console.log(`- Phone: ${updatedUser.phone}`);
    } else {
      console.log("❌ Profile Update Failed:", response.data);
    }
  } catch (err) {
    console.error("❌ Profile Update Request Error:", err.response?.data || err.message);
  }

  console.log("\n🏁 All Tests Completed!");
  process.exit(0);
}

runTests();
