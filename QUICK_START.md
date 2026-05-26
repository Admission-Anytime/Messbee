# Razorpay Integration - Quick Start Guide

**Status:** ✅ IMPLEMENTATION COMPLETE & TESTED

---

## 🚀 Quick Start (5 Minutes)

### 1. Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# App starts on http://localhost:5173
```

### 2. Test Payment Flow

1. Open browser: http://localhost:5173/pricing
2. Click any plan → "Buy Now"
3. Click "Pay & Upgrade Now" button
4. Razorpay modal opens
5. Enter test card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
6. Click "Pay"
7. ✅ See success screen!

---

## 📋 What Was Done

### Backend Changes
- ✅ Created Razorpay service (`services/razorpayService.js`)
- ✅ Added 3 new payment endpoints
- ✅ Implemented webhook handlers
- ✅ Extended Transaction model with Razorpay fields
- ✅ Auto-update user credits/subscription on payment

### Frontend Changes  
- ✅ Added Razorpay script to `index.html`
- ✅ Updated payment button to use Razorpay checkout
- ✅ Created helper functions in `razorpayHelper.js`
- ✅ Integrated success/error handling

### Documentation
- ✅ Full API documentation (`RAZORPAY_API_DOCS.md`)
- ✅ Testing guide (`RAZORPAY_TEST_GUIDE.js`)
- ✅ Implementation summary (`RAZORPAY_INTEGRATION_SUMMARY.md`)

---

## 🧪 Test Cards for Different Scenarios

| Scenario | Card Number | CVV | Expiry | Result |
|----------|-------------|-----|--------|--------|
| **Success** | 4111 1111 1111 1111 | 123 | 12/25 | ✅ Payment approved |
| **Failure** | 4000 0000 0000 0002 | 123 | 12/25 | ❌ Payment declined |
| **3D Secure** | 5555 5555 5555 4444 | 222 | 12/25 | 🔐 OTP required |
| **UPI** | N/A | N/A | N/A | Use: test@razorpay |

---

## 💰 Payment Scenarios

### 1. Subscription Upgrade
```
Plan: Professional
Billing: Yearly
Base Price: ₹27,672 (12 months)
Discount: 35% = -₹9,685
Subtotal: ₹17,987
GST (18%): ₹3,237
Total: ₹21,224
```

### 2. Credit Top-up
```
Credits: 500
Amount: ₹1,000
All of it goes to user account as credits
```

### 3. Campaign Cost
```
Cost: Based on number of recipients
Deducts from user credits
Can be paid via Razorpay if credits low
```

---

## 🔗 API Endpoints

### Create Payment Order
```http
POST http://localhost:5000/api/billing/razorpay/create-order
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "scenario": "subscription",
  "amount": 5000,
  "planType": "professional",
  "billingCycle": "yearly"
}
```

### Verify Payment
```http
POST http://localhost:5000/api/billing/razorpay/verify-payment
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "orderId": "order_M7CjCa3yKO8yJb",
  "paymentId": "pay_M7CjCa4yKO8yJb",
  "signature": "9ef4dffbfd84f1318f...",
  "transactionId": "TXN-49281948"
}
```

### Webhook (Automatic)
```http
POST http://localhost:5000/api/billing/razorpay/webhook
(No authentication - signature verified)
```

---

## 📊 Database Updated

### Transaction Record
```javascript
{
  transactionId: "TXN-49281948",
  user: ObjectId(...),
  amount: 21224,
  status: "Paid",
  razorpayOrderId: "order_M7CjCa3yKO8yJb",
  razorpayPaymentId: "pay_M7CjCa4yKO8yJb",
  metadata: {
    scenario: "subscription",
    planType: "professional",
    billingCycle: "yearly",
    paymentMethod: "card"
  }
}
```

### User Record Updated
```javascript
{
  subscriptionPlan: "professional",
  subscriptionEndDate: 2027-05-27T00:00:00Z,
  credits: 1000 // if credit topup
}
```

---

## 🔐 Security Features

✅ **Signature Verification** - HMAC SHA256 verification on all payments
✅ **JWT Authentication** - Protected endpoints require login
✅ **Webhook Signature Validation** - Webhook events are verified
✅ **User Isolation** - Users see only their transactions
✅ **Idempotency** - Transaction IDs prevent duplicate charges

---

## 📈 Monitoring Payments

### Check Transaction History (MongoDB)
```bash
# Connect to MongoDB Atlas
# In MongoDB Compass or mongosh:

db.transactions.find({ status: "Paid" }).sort({ createdAt: -1 })
```

### Check User Subscription
```bash
db.users.findOne({ email: "user@example.com" }, {
  subscriptionPlan: 1,
  subscriptionEndDate: 1,
  credits: 1
})
```

### View Server Logs
```bash
# Server console (Terminal 1)
# Look for success/failure messages
# Example: "Payment verified for TXN-49281948"
```

---

## ⚠️ Important Notes

1. **Test Mode Only**
   - Currently using test API keys
   - No real money transactions
   - Cards are simulated

2. **Production Deployment**
   - Replace test keys in `.env` with production keys
   - Register webhook URL in Razorpay Dashboard
   - Enable HTTPS for webhook
   - Test with real cards before launch

3. **Webhook URL**
   - Must be publicly accessible
   - Currently: `http://localhost:5000/api/billing/razorpay/webhook`
   - Production: `https://yourdomain.com/api/billing/razorpay/webhook`

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Razorpay is not defined" | Hard refresh browser (Ctrl+Shift+R) |
| "Invalid signature" | Check RAZORPAY_KEY_SECRET in .env |
| "Order creation failed" | Verify RAZORPAY_KEY_ID in .env |
| Payment not updating user | Check MongoDB connection & user ID |
| Webhook not firing | Register URL in Razorpay Dashboard |

---

## 📚 Full Documentation

- **API Details:** See `RAZORPAY_API_DOCS.md`
- **Testing Guide:** See `RAZORPAY_TEST_GUIDE.js`
- **Implementation:** See `RAZORPAY_INTEGRATION_SUMMARY.md`

---

## ✅ Checklist

- [x] Backend endpoints created
- [x] Frontend integrated
- [x] Test cards working
- [x] Database updating
- [x] Error handling
- [x] Documentation complete
- [ ] Production keys configured (coming)
- [ ] Webhook URL registered (coming)
- [ ] Production testing (coming)
- [ ] Go live! 🚀

---

## 🎯 Next Steps

1. **Test thoroughly** with all test cards
2. **Review transactions** in MongoDB
3. **Check webhook** configuration (when ready)
4. **Switch to production keys** when ready
5. **Deploy to production**
6. **Monitor payments** in first week

---

**Questions?**
Check the documentation files or review the server logs for detailed error messages.

**Ready to test?** Start the servers and visit http://localhost:5173/pricing! 🎉
