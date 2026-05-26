# Razorpay Integration - Configuration Checklist

## Current Status
**Development Environment:** ✅ READY FOR TESTING
**Production Environment:** ⏳ PENDING CONFIGURATION

---

## Part 1: Current Configuration ✅

### Environment Variables (.env)
```
✅ RAZORPAY_KEY_ID=rzp_test_StgCM4i5byPotm
✅ RAZORPAY_KEY_SECRET=0aJNF4aSU2F1gNxSeV7qnY8f
⏳ RAZORPAY_WEBHOOK_SECRET=(configure when registering webhook)
```

### Backend Files
```
✅ server/services/razorpayService.js (250+ lines)
✅ server/controllers/billingController.js (extended +400 lines)
✅ server/routes/billingRoutes.js (updated with 3 new routes)
✅ server/models/Transaction.js (extended with Razorpay fields)
✅ server/package.json (razorpay@^2.9.2 added)
```

### Frontend Files
```
✅ client/index.html (Razorpay script added)
✅ client/src/pages/PlanPricing/UpgradePlan.jsx (handlePay updated)
✅ client/src/utils/razorpayHelper.js (helper functions)
```

### Documentation
```
✅ RAZORPAY_API_DOCS.md (full API reference)
✅ RAZORPAY_TEST_GUIDE.js (testing procedures)
✅ RAZORPAY_INTEGRATION_SUMMARY.md (implementation details)
✅ QUICK_START.md (getting started guide)
✅ server/RAZORPAY_TEST_GUIDE.js (server-side testing)
```

---

## Part 2: Development Testing (Current) ✅

### Prerequisites
- [ ] `npm install` completed in server folder (razorpay package installed)
- [ ] `.env` file has test credentials
- [ ] MongoDB connection verified
- [ ] Server runs without errors: `npm run dev`
- [ ] Client runs without errors: `npm run dev`

### Quick Validation
```bash
# Check razorpay package installed
npm list razorpay

# Test syntax of backend files
node -c services/razorpayService.js

# Start server in dev mode
npm run dev
```

### Browser Testing
- [ ] Navigate to http://localhost:5173/pricing
- [ ] Click plan → "Buy Now"
- [ ] Click "Pay & Upgrade Now"
- [ ] Modal opens (not errors)
- [ ] Test card works: 4111 1111 1111 1111
- [ ] Success screen appears
- [ ] Check MongoDB for transaction record
- [ ] Check user subscription updated

### API Testing (Postman/cURL)
- [ ] POST /api/billing/razorpay/create-order (success)
- [ ] POST /api/billing/razorpay/verify-payment (success)
- [ ] Invalid signature rejection (400)
- [ ] Missing fields rejection (400)

---

## Part 3: Production Preparation (DO BEFORE GOING LIVE)

### Step 1: Get Production Keys from Razorpay
```
[ ] Log in to https://dashboard.razorpay.com (Production mode)
[ ] Navigate to: Settings → API Keys
[ ] Copy Production Key ID (rzp_live_...)
[ ] Copy Production Key Secret (keep secure!)
[ ] Save in secure location (password manager, vault, etc.)
[ ] DO NOT commit to Git
```

### Step 2: Update Environment Variables
```env
# Update .env file:
# OLD (test):
# RAZORPAY_KEY_ID=rzp_test_StgCM4i5byPotm
# RAZORPAY_KEY_SECRET=0aJNF4aSU2F1gNxSeV7qnY8f

# NEW (production):
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxx
NODE_ENV=production
```

### Step 3: Register Webhook URL
```
[ ] Go to https://dashboard.razorpay.com (Production mode)
[ ] Settings → Webhooks
[ ] Add New Webhook
[ ] URL: https://yourdomain.com/api/billing/razorpay/webhook
[ ] Select Events:
    - [ ] payment.authorized
    - [ ] payment.captured
    - [ ] payment.failed
    - [ ] subscription.charged_successfully
    - [ ] subscription.halted
[ ] Copy Webhook Secret
[ ] Update RAZORPAY_WEBHOOK_SECRET in .env
```

### Step 4: Security Configuration

#### HTTPS/SSL
```
[ ] SSL certificate configured
[ ] HTTPS enabled on domain
[ ] Webhook URL is https:// (not http://)
[ ] Mixed content warnings resolved
```

#### CORS Configuration
```
[ ] Update CORS whitelist in server.js:
    - [ ] Remove localhost entries
    - [ ] Add production domain
    - [ ] Add www subdomain
    - [ ] Allow Razorpay IPs (optional but recommended)
```

#### Rate Limiting
```
[ ] Implement rate limiting on payment endpoints:
    - [ ] /api/billing/razorpay/create-order (max 10 requests/minute per user)
    - [ ] /api/billing/razorpay/verify-payment (max 5 requests/minute per user)
    - [ ] /api/billing/razorpay/webhook (max 100 requests/minute)
```

#### Input Validation
```
[ ] Validate all request inputs
[ ] Validate currency (INR only)
[ ] Validate amount (positive, realistic range)
[ ] Sanitize user inputs
[ ] Reject invalid scenarios
```

---

## Part 4: Database Preparation

### Backup
```
[ ] Backup MongoDB (atlas snapshot)
[ ] Test restore procedure
[ ] Document backup location
[ ] Set auto-backup to weekly
```

### Indexing (Performance)
```
[ ] Create indexes on Transaction collection:
    db.transactions.createIndex({ razorpayOrderId: 1 })
    db.transactions.createIndex({ razorpayPaymentId: 1 })
    db.transactions.createIndex({ user: 1, createdAt: -1 })
```

### Migration
```
[ ] Existing users have subscriptionPlan field
[ ] Existing users have subscriptionEndDate field
[ ] User.credits field initialized (0 if null)
```

---

## Part 5: Notification & Email Setup

### Payment Success Email
```
[ ] Template created for payment success
[ ] Recipient: user.email
[ ] Include: transaction ID, amount, plan details
[ ] Template file: server/email-templates/payment-success.html
```

### Payment Failure Email
```
[ ] Template created for payment failure
[ ] Recipient: user.email
[ ] Include: failure reason, retry link
[ ] Template file: server/email-templates/payment-failed.html
```

### Admin Notifications
```
[ ] Payment status dashboard created
[ ] Alert threshold configured (e.g., >5 failures/hour)
[ ] Admin email notifications enabled
```

---

## Part 6: Testing in Production Mode

### Pre-Launch Testing
```
[ ] Update .env with test keys (keep separate configs)
[ ] Deploy to staging server
[ ] Test full payment flow
[ ] Test webhook processing
[ ] Verify emails sent
[ ] Check database transactions
[ ] Review server logs for errors
```

### Load Testing
```
[ ] Simulate 10 concurrent payments
[ ] Verify no race conditions
[ ] Check database locks
[ ] Monitor server CPU/memory
[ ] Measure response times
```

### Security Testing
```
[ ] Test signature verification with invalid signature
[ ] Test CORS restrictions
[ ] Test rate limiting
[ ] SQL injection attempts (should fail)
[ ] CSRF token validation
```

---

## Part 7: Monitoring & Alerting

### Application Monitoring
```
[ ] Sentry/LogRocket setup (error tracking)
[ ] DataDog/New Relic setup (performance)
[ ] Uptime monitoring configured
[ ] Alerts for:
    - [ ] Endpoint response time > 2s
    - [ ] Error rate > 5%
    - [ ] Webhook failures > 3
    - [ ] Database connection issues
```

### Payment Monitoring
```
[ ] Dashboard showing:
    - [ ] Payments in last 24h
    - [ ] Failed payment rate
    - [ ] Average payment time
    - [ ] Revenue by plan
[ ] Reconciliation script created
[ ] Daily payment reports automated
```

### Log Management
```
[ ] Centralized logging setup (CloudWatch, ELK, etc.)
[ ] Log retention: 30 days minimum
[ ] Structured logging format
[ ] Sensitive data masking (no full payment IDs in logs)
```

---

## Part 8: Documentation & Training

### Team Documentation
```
[ ] Payment flow documented for team
[ ] Troubleshooting guide created
[ ] Incident response playbook
[ ] Admin panel guide (if applicable)
```

### Customer Documentation
```
[ ] FAQ about payment methods
[ ] Refund policy documented
[ ] Payment error messages clear
[ ] Contact support link visible
```

### Developer Documentation
```
[ ] API documentation updated (public/private)
[ ] Code comments added for complex logic
[ ] Deployment guide updated
[ ] Rollback procedure documented
```

---

## Part 9: Refund & Dispute Handling

### Refund API
```
[ ] Refund endpoint implemented: POST /api/billing/refunds
[ ] Verify refund eligibility (within 30 days, etc.)
[ ] Update transaction status to "Refunded"
[ ] Update user credits/subscription appropriately
[ ] Send refund confirmation email
```

### Dispute/Chargeback Handling
```
[ ] Chargeback monitoring enabled
[ ] Alert system for disputes
[ ] Documentation of transaction (screenshots, etc.)
[ ] Response procedure documented
[ ] Escalation process defined
```

---

## Part 10: Compliance & Legal

### PCI Compliance
```
[ ] No card data stored in our database
[ ] All card processing via Razorpay (compliant)
[ ] SSL certificate valid
[ ] No card data in logs
```

### GDPR Compliance
```
[ ] User data deletion request implemented
[ ] Payment data retention policy (7 years recommended)
[ ] Privacy policy updated
[ ] Consent recorded at payment
```

### Tax/GST
```
[ ] GST calculation correct (18% for India)
[ ] Invoices generated correctly
[ ] Tax ID added to invoices
[ ] Quarterly tax reports prepared
```

---

## Part 11: Post-Launch Monitoring

### First Week
```
[ ] Monitor all payment transactions
[ ] Check for any errors in logs
[ ] Verify webhooks firing correctly
[ ] Test refund process
[ ] Monitor customer feedback
```

### First Month
```
[ ] Analyze payment success rate (target: >98%)
[ ] Review failed payment reasons
[ ] Check average payment time (<2s)
[ ] Verify no duplicate charges
[ ] Reconcile transactions
```

### Ongoing
```
[ ] Weekly payment report review
[ ] Monthly revenue analysis
[ ] Quarterly security audit
[ ] Annual compliance review
```

---

## Part 12: Rollback Plan (In case of issues)

### If Something Goes Wrong
```
1. [ ] Immediately revert to backup
2. [ ] Disable payment endpoints
3. [ ] Notify users (payment system temporarily down)
4. [ ] Revert .env to test keys
5. [ ] Deploy previous version
6. [ ] Verify system stability
7. [ ] Investigate root cause
8. [ ] Fix and test thoroughly
9. [ ] Deploy again with monitoring
```

### Communication
```
[ ] Status page setup (e.g., status.messbee.com)
[ ] Team communication plan
[ ] Customer communication template
[ ] Incident post-mortem process
```

---

## Final Checklist Before Go-Live

```
SECURITY
[ ] All keys secured (not in Git)
[ ] HTTPS enabled
[ ] Rate limiting active
[ ] Input validation strict
[ ] Signature verification tested

FUNCTIONALITY
[ ] All payment scenarios tested
[ ] Webhook events verified
[ ] Error handling tested
[ ] Email notifications working
[ ] Database transactions correct

MONITORING
[ ] Alerts configured
[ ] Logs centralized
[ ] Dashboard created
[ ] Team trained

DOCUMENTATION
[ ] API docs updated
[ ] Team docs complete
[ ] Customer docs clear
[ ] Runbooks created

TESTING
[ ] Load testing passed
[ ] Security testing passed
[ ] Integration testing passed
[ ] UAT approved

GO-LIVE
[ ] Backup taken
[ ] Rollback plan ready
[ ] Team on standby
[ ] Customer announcement ready
[ ] Launch!
```

---

## Support & Resources

**Razorpay Support:**
- Email: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs

**Internal Resources:**
- Slack Channel: #payments
- Wiki: Wiki.messbee.com/payments
- On-call: [DevOps Team]

---

**Last Updated:** May 27, 2026
**Current Phase:** Development Testing
**Next Phase:** Production Deployment
**Estimated Timeline:** 1-2 weeks until production ready
