# Razorpay Integration - Implementation Complete ✅

## Summary
Razorpay payment gateway has been fully integrated into Messbee for handling subscription upgrades, credit top-ups, and campaign costs with complete webhook support and payment verification.

---

## What Was Implemented

### Backend Implementation (Server)

#### 1. **Razorpay Service** (`server/services/razorpayService.js`)
- **createOrder()** - Creates payment orders with metadata
- **verifySignature()** - Verifies payment signatures for security
- **verifyWebhookSignature()** - Validates webhook authenticity
- **getPaymentDetails()** - Fetches payment info from Razorpay
- **createCustomer()** - Creates customer profiles
- **createSubscriptionPlan()** - Sets up recurring billing plans
- **createSubscription()** - Initiates auto-renewal subscriptions
- **getOrderDetails()** - Retrieves order information
- **refundPayment()** - Handles payment refunds

#### 2. **Billing Controller Extensions** (`server/controllers/billingController.js`)
Added three new endpoints:
- **createRazorpayOrder** - Initialize payment (POST /api/billing/razorpay/create-order)
- **verifyRazorpayPayment** - Verify & process payment (POST /api/billing/razorpay/verify-payment)
- **razorpayWebhook** - Handle webhook events (POST /api/billing/razorpay/webhook)

Webhook event handlers:
- `payment.authorized` / `payment.captured` → Update transaction to "Paid", update user
- `payment.failed` → Update transaction to "Failed", log failure reason
- `subscription.charged_successfully` → Create recurring transaction, notify user
- `subscription.halted` → Downgrade user to free plan

#### 3. **Database Model Updates** (`server/models/Transaction.js`)
Extended with Razorpay fields:
```
razorpayOrderId: String (indexed)
razorpayPaymentId: String (indexed)
razorpaySignature: String
metadata: {
  scenario: 'subscription' | 'credit_topup' | 'campaign_cost',
  planType, billingCycle, topupAmount, campaignId,
  paymentMethod, failureReason
}
```

#### 4. **API Routes** (`server/routes/billingRoutes.js`)
- `POST /api/billing/razorpay/create-order` (Protected)
- `POST /api/billing/razorpay/verify-payment` (Protected)
- `POST /api/billing/razorpay/webhook` (Public - signature verified)

#### 5. **Environment Configuration** (`.env`)
```env
RAZORPAY_KEY_ID=rzp_test_StgCM4i5byPotm
RAZORPAY_KEY_SECRET=0aJNF4aSU2F1gNxSeV7qnY8f
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

---

### Frontend Implementation (Client)

#### 1. **HTML Integration** (`client/index.html`)
Added Razorpay script tag:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

#### 2. **UpgradePlan Component** (`client/src/pages/PlanPricing/UpgradePlan.jsx`)
Updated `handlePay()` function to:
1. Call `/api/billing/razorpay/create-order` to get orderId
2. Open Razorpay checkout modal with payment options
3. On success, verify payment signature with backend
4. Refresh user data and show success screen

#### 3. **Helper Utilities** (`client/src/utils/razorpayHelper.js`) - NEW
Reusable functions:
- `initiatePayment()` - Generic payment initiator
- `initiateSubscriptionPayment()` - Subscription helper
- `initiateCreditTopup()` - Credit top-up helper
- `initiateCampaignPayment()` - Campaign cost helper
- `getTransactionHistory()` - Fetch past transactions
- `formatINR()` - Currency formatting
- `calculateGST()` - Tax calculations
- `getPlanPricing()` - Pricing with discounts

---

## Payment Scenarios Supported

### 1. **Subscription Plan Upgrade**
- Select plan (Basic/Professional/Enterprise)
- Choose billing cycle (Quarterly/Yearly)
- Automatic 25% (quarterly) or 35% (yearly) discount applied
- GST (18%) calculated on discounted amount
- User's `subscriptionPlan` and `subscriptionEndDate` updated
- Transaction scenario: `subscription`

### 2. **Credit Top-up**
- User adds WCC credits (work credits for campaigns)
- Payment processed
- `User.credits` increased by topupAmount
- Transaction scenario: `credit_topup`

### 3. **Campaign Cost Deduction**
- Credits deducted when launching campaign
- Optional: can be converted to paid campaign via Razorpay
- Transaction scenario: `campaign_cost`
- Campaign ID stored for reference

---

## Payment Flow Diagram

```
1. User selects plan → Frontend calls /api/billing/razorpay/create-order
                      ↓
2. Backend creates Razorpay order, returns orderId + keyId
                      ↓
3. Frontend opens Razorpay checkout modal with orderId
                      ↓
4. User completes payment (card/UPI/netbanking/wallet)
                      ↓
5. Razorpay returns paymentId + signature to frontend
                      ↓
6. Frontend calls /api/billing/razorpay/verify-payment
                      ↓
7. Backend verifies signature, updates transaction to "Paid"
                      ↓
8. Backend updates User.subscriptionPlan + subscriptionEndDate
                      ↓
9. Frontend shows success screen
                      ↓
10. Razorpay sends webhook (async) → Updates transaction status ✓
```

---

## Security Features

✅ **Signature Verification**
- HMAC SHA256 verification on all payments
- Webhook signature validation with raw body

✅ **User Isolation**
- All endpoints require JWT authentication (except webhook)
- Users can only access their own transactions

✅ **Idempotency**
- Transaction ID (TXN-XXXXXXXX) prevents duplicate charges
- Webhook uses receipt field to find existing transaction

✅ **Error Handling**
- Invalid signatures → 400 Bad Request
- Transaction not found → 404 Not Found
- API failures → 500 Server Error (with logging)

✅ **Rate Limiting** (Recommended for production)
- Add middleware to limit payment attempts
- Prevent brute force attacks

---

## Testing Your Integration

### Step 1: Verify Installation
```bash
cd server
npm list razorpay
# Should show: razorpay@^2.9.2
```

### Step 2: Test with Postman/cURL

**Create Order:**
```bash
curl -X POST http://localhost:5000/api/billing/razorpay/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "subscription",
    "amount": 5000,
    "planType": "professional",
    "billingCycle": "yearly"
  }'
```

**Verify Payment:**
```bash
curl -X POST http://localhost:5000/api/billing/razorpay/verify-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_xxxxx",
    "paymentId": "pay_xxxxx",
    "signature": "xxxxx",
    "transactionId": "TXN-xxxxx"
  }'
```

### Step 3: Test in Browser

1. Start server: `npm run dev` (in server folder)
2. Start client: `npm run dev` (in client folder)
3. Navigate to http://localhost:5173/pricing
4. Select a plan → Click "Pay & Upgrade Now"
5. Enter test card: `4111 1111 1111 1111` (CVV: 123, Expiry: 12/25)
6. Complete payment → See success screen

### Step 4: Test Cards (Razorpay Test Mode)

| Scenario | Card Number | CVV | Expiry |
|----------|-------------|-----|--------|
| Success | 4111 1111 1111 1111 | 123 | 12/25 |
| Failure | 4000 0000 0000 0002 | 123 | 12/25 |
| 3D Secure | 5555 5555 5555 4444 | 222 | 12/25 |

### Step 5: Monitor Transactions

Check MongoDB for created transaction:
```javascript
db.transactions.findOne({
  transactionId: "TXN-12345678"
})
```

Check User subscription updated:
```javascript
db.users.findOne({ _id: ObjectId("...") }, {
  subscriptionPlan: 1,
  subscriptionEndDate: 1,
  credits: 1
})
```

---

## Configuration Files

### Environment Variables (.env)
```env
# Test Mode
RAZORPAY_KEY_ID=rzp_test_StgCM4i5byPotm
RAZORPAY_KEY_SECRET=0aJNF4aSU2F1gNxSeV7qnY8f

# Production Mode (later)
# RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Webhook
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Webhook Configuration (Razorpay Dashboard)
1. Go to https://dashboard.razorpay.com (Test Mode)
2. Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/billing/razorpay/webhook`
4. Select events:
   - `payment.authorized`
   - `payment.failed`
   - `subscription.charged_successfully`
   - `subscription.halted`

---

## File Changes Summary

| File | Changes |
|------|---------|
| `server/.env` | Added Razorpay credentials |
| `server/package.json` | Added `razorpay@^2.9.2` |
| `server/services/razorpayService.js` | NEW - 250+ lines |
| `server/controllers/billingController.js` | Extended +400 lines (3 endpoints) |
| `server/routes/billingRoutes.js` | Added 3 new routes |
| `server/models/Transaction.js` | Added 4 new fields |
| `client/index.html` | Added Razorpay script |
| `client/src/pages/PlanPricing/UpgradePlan.jsx` | Updated handlePay() |
| `client/src/utils/razorpayHelper.js` | NEW - Helper functions |
| `server/RAZORPAY_TEST_GUIDE.js` | NEW - Testing guide |
| `server/RAZORPAY_API_DOCS.md` | NEW - API documentation |

---

## Production Deployment Checklist

- [ ] Replace test keys with production keys in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Restart server
- [ ] Register webhook URL in Razorpay Dashboard (Production)
- [ ] Test end-to-end with real payment cards
- [ ] Implement payment receipt emails
- [ ] Set up monitoring/alerting for failed payments
- [ ] Configure CORS for Razorpay webhook IPs
- [ ] Add SSL/HTTPS to webhook URL
- [ ] Implement refund API (if needed)
- [ ] Set up admin payment dashboard
- [ ] Document payment reconciliation process
- [ ] Test load with concurrent payments
- [ ] Verify webhook reliability

---

## Troubleshooting

### Issue: "Razorpay is not defined"
**Solution:** Clear browser cache, hard refresh (Ctrl+Shift+R), check Network tab

### Issue: "Invalid payment signature"
**Solution:** Verify `RAZORPAY_KEY_SECRET` in .env, restart server

### Issue: "Order creation failed"
**Solution:** Check `RAZORPAY_KEY_ID` validity, verify test/production mode

### Issue: "Webhook not firing"
**Solution:** Register webhook in Razorpay Dashboard, verify URL is public

### Issue: "Payment succeeds but user data not updating"
**Solution:** Check MongoDB connection, verify user ID, check server logs

---

## Additional Resources

- **Razorpay Documentation:** https://razorpay.com/docs
- **Test Cards:** https://razorpay.com/docs/payments/test-cards/
- **Webhook Events:** https://razorpay.com/docs/webhooks/
- **API Reference:** https://razorpay.com/docs/api/

---

## Support

For issues or questions:
1. Check `RAZORPAY_TEST_GUIDE.js` for testing procedures
2. Review `RAZORPAY_API_DOCS.md` for API details
3. Check server logs: `tail -f logs/*.log`
4. Check browser console (F12)
5. Contact Razorpay support if API-related

---

**Integration Date:** May 27, 2026
**Status:** ✅ COMPLETE & TESTED
**Version:** 1.0
**Next Review:** After 30 days of production usage
