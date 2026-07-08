/**
 * Test file for Cross-Verification Payment APIs
 * Run with: npm run test:cross-verify
 * 
 * This file tests all three new cross-verification endpoints
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;
let authToken = '';

// Test data (update with your actual test data)
const testData = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTEzZTM4NWQ0MDgyMzczYTdlMDcyNCIsImVtYWlsIjoiaGl0ZXNoQGdtYWlsLmNvbSIsInJvbGUiOiJBR0VOVCIsImlhdCI6MTc4MDMzMDkwMCwiZXhwIjoxNzgwNDE3MzAwfQ.qSDjEQY_ANmHXPLz7AChJniaZUxSP1L_0Pv8C1DosGA', // from login response
  userId: '6a113e385d4082373a7e0724',
  orderId: 'order_ABC123', // From Razorpay — replace with real value
  paymentId: 'pay_ABC123', // From Razorpay — replace with real value
  signature: 'signature_from_razorpay', // From Razorpay — replace with real value
  transactionId: 'TXN-12345678'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

function printError(err) {
  try {
    if (!err) return console.error('Error: <no error object>');
    console.error('--- Error Start ---');
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response headers:', JSON.stringify(err.response.headers || {}, null, 2));
      console.error('Response data:', JSON.stringify(err.response.data || err.response.text || {}, null, 2));
    }
    console.error('Message:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    console.error('--- Error End ---');
  } catch (ex) {
    console.error('Failed to print error details', ex);
  }
}

/**
 * Test 1: Cross-Verify Payment
 */
async function testCrossVerifyPayment() {
  try {
    log.info('Testing Cross-Verify Payment Endpoint...');
    
    const response = await axios.post(
      `${BASE_URL}/billing/razorpay/cross-verify`,
      {
        orderId: testData.orderId,
        paymentId: testData.paymentId,
        transactionId: testData.transactionId
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.verified) {
      log.success('Cross-verification passed!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      log.warn('Payment verification returned unverified status');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
    return response.data;
  } catch (error) {
    log.error('Cross-Verify Payment test failed');
    printError(error);
    return null;
  }
}

/**
 * Test 2: Get Order Status
 */
async function testGetOrderStatus() {
  try {
    log.info('Testing Get Order Status Endpoint...');
    
    const response = await axios.post(
      `${BASE_URL}/billing/razorpay/order-status`,
      {
        orderId: testData.orderId
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    log.success('Order status retrieved successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    log.error('Get Order Status test failed');
    printError(error);
    return null;
  }
}

/**
 * Test 3: Reconcile Payment
 */
async function testReconcilePayment() {
  try {
    log.info('Testing Reconcile Payment Endpoint...');
    
    const response = await axios.post(
      `${BASE_URL}/billing/razorpay/reconcile`,
      {
        orderId: testData.orderId,
        clientPaymentId: testData.paymentId,
        clientSignature: testData.signature,
        clientStatus: 'success',
        transactionId: testData.transactionId
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.action === 'approve') {
      log.success('Payment reconciliation approved!');
    } else {
      log.warn('Payment reconciliation rejected');
      log.info(`Mismatches: ${response.data.mismatches.join(', ')}`);
    }
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    log.error('Reconcile Payment test failed');
    printError(error);
    return null;
  }
}

/**
 * Test 4: Fraud Detection - Fake Success Claim
 */
async function testFraudDetection() {
  try {
    log.info('Testing Fraud Detection (Fake Success Claim)...');
    
    const response = await axios.post(
      `${BASE_URL}/billing/razorpay/reconcile`,
      {
        orderId: testData.orderId,
        clientPaymentId: 'pay_FAKE_123', // Fake payment ID
        clientSignature: 'fake_signature',
        clientStatus: 'success',
        transactionId: testData.transactionId
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.action === 'reject') {
      log.success('Fraud detection working! Fake payment was rejected.');
    } else {
      log.error('Fraud detection failed - fake payment was approved');
    }
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    log.error('Fraud Detection test failed');
    printError(error);
    return null;
  }
}

/**
 * Test 5: Missing Parameters
 */
async function testMissingParameters() {
  try {
    log.info('Testing Missing Parameters Handling...');
    
    const response = await axios.post(
      `${BASE_URL}/billing/razorpay/cross-verify`,
      {
        orderId: testData.orderId
        // Missing: paymentId and transactionId
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    log.error('Should have failed with missing parameters');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response?.status === 400) {
      log.success('Correctly rejected request with missing parameters');
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      log.error('Unexpected error');
      printError(error);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Cross-Verification Payment API Tests           ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  // Check if token is set
  if (!testData.token || testData.token === 'YOUR_JWT_TOKEN_HERE') {
    log.error('JWT Token not set! Update testData.token in this file');
    process.exit(1);
  }
  
  authToken = testData.token;
  
  log.info('Starting test suite...\n');
  
  // Run tests
  console.log(`${colors.blue}Test 1: Cross-Verify Payment${colors.reset}`);
  await testCrossVerifyPayment();
  console.log('');
  
  console.log(`${colors.blue}Test 2: Get Order Status${colors.reset}`);
  await testGetOrderStatus();
  console.log('');
  
  console.log(`${colors.blue}Test 3: Reconcile Payment${colors.reset}`);
  await testReconcilePayment();
  console.log('');
  
  console.log(`${colors.blue}Test 4: Fraud Detection${colors.reset}`);
  await testFraudDetection();
  console.log('');
  
  console.log(`${colors.blue}Test 5: Missing Parameters${colors.reset}`);
  await testMissingParameters();
  console.log('');
  
  console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Tests Complete                                 ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    log.error('Test suite failed');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  testCrossVerifyPayment,
  testGetOrderStatus,
  testReconcilePayment,
  testFraudDetection,
  testMissingParameters,
  runAllTests
};
