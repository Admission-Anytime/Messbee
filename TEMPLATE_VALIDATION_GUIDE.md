# WhatsApp Template Validation & Rejection Analysis Guide

## Overview

This guide explains how to use the template validation and rejection analysis system to prevent Meta rejections and improve template approval rates.

---

## 🎯 Key Features

### 1. **Pre-Submission Validation**
Validates templates BEFORE submission to Meta, catching common rejection reasons:
- Template name format and length
- Category selection
- Language code
- Media type compatibility
- Body text quality and grammar
- Footer text constraints
- Button configuration

### 2. **Rejection Analysis**
Analyzes WHY templates were rejected and provides specific solutions for each rejection reason.

### 3. **Batch Rejection Review**
View all rejected templates and their analysis together with next steps.

---

## 📡 API Endpoints

### 1. Validate Template Before Submission

**Endpoint:** `POST /api/whatsapp/templates/validate`

**Purpose:** Check if your template will pass Meta's validation before submission.

**Request Headers:**
```
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "order_status_update",
  "category": "TRANSACTIONAL",
  "language": "en_US",
  "mediaType": "IMAGE",
  "bodyText": "Hi {{1}}, your order {{2}} has been {{3}}. Track it here: {{4}}",
  "footerText": "Thank you for shopping with us",
  "buttons": [
    {
      "type": "URL",
      "text": "Track Order",
      "url": "https://example.com/track?order={{2}}"
    },
    {
      "type": "QUICK_REPLY",
      "text": "Help"
    }
  ]
}
```

**Response (Success - ✅ Template Valid):**
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "totalIssues": 0,
    "summary": "All validation checks passed!",
    "errors": [],
    "warnings": []
  },
  "message": "✅ Template is ready for submission!"
}
```

**Response (Failure - ⚠️ Template Has Issues):**
```json
{
  "success": false,
  "validation": {
    "isValid": false,
    "totalIssues": 3,
    "summary": "3 issues found - 2 errors, 1 warning",
    "errors": [
      {
        "field": "name",
        "message": "Template name 'Order Status Update' is not lowercase_underscore format",
        "suggestion": "Change to: order_status_update"
      },
      {
        "field": "buttons",
        "message": "Button text 'Track Order' is too long (11 chars, max 20 allowed)",
        "suggestion": "Shorten to 'Track' or 'View Order'"
      }
    ],
    "warnings": [
      {
        "field": "footerText",
        "message": "Footer text is 33 chars (recommended max 60)",
        "suggestion": "Footer length is acceptable"
      }
    ]
  },
  "message": "⚠️ Please fix the errors before submitting"
}
```

**Validation Categories Checked:**

1. **Template Name**
   - Must be lowercase with underscores only
   - Length: 4-60 characters
   - No spaces or special characters

2. **Category**
   - Valid values: `MARKETING`, `OTP`, `TRANSACTIONAL`
   - Required field

3. **Language Code**
   - Valid examples: `en_US`, `hi_IN`, `es_ES`, `ar_SA`, `pt_BR`
   - Required field

4. **Media Type** (if present)
   - Valid values: `IMAGE`, `VIDEO`, `DOCUMENT`
   - Must match uploaded media

5. **Body Text**
   - Max 1024 characters
   - Checks for grammatical issues
   - Detects misleading claims
   - Validates placeholder format ({{1}}, {{2}}, etc.)
   - Warns about excessive punctuation

6. **Footer Text**
   - Max 60 characters (recommended)
   - Should not contain promotional claims

7. **Buttons**
   - Max 3 buttons per template
   - Types: `QUICK_REPLY`, `URL`, `PHONE_NUMBER`
   - URL buttons: URLs must be valid format
   - Phone buttons: Must be valid international format

---

### 2. Analyze Rejection Reason

**Endpoint:** `GET /api/whatsapp/templates/analyze-rejection/:rejectionReason`

**Purpose:** Understand WHY your template was rejected and get specific solutions.

**URL Parameters:**
```
rejectionReason: MISLEADING_CONTENT | POOR_QUALITY | INVALID_NAME | GRAMMAR_ISSUES | 
                 POLICY_VIOLATION | SUSPICIOUS_LINK | INVALID_BUTTON | EXCESSIVE_FORMATTING
```

**Request Example:**
```
GET /api/whatsapp/templates/analyze-rejection/MISLEADING_CONTENT
Authorization: Bearer {YOUR_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "title": "Misleading Content Detected",
      "description": "Your template contains claims or language that Meta considers misleading or deceptive to users.",
      "commonExamples": [
        "Using false urgency ('Only 1 left in stock')",
        "Fake endorsements",
        "Unverified health claims",
        "Too-good-to-be-true offers"
      ],
      "solutions": [
        "Remove urgency language unless it's genuine",
        "Use factual, verifiable claims only",
        "Don't make health or medical claims",
        "Remove fake endorsements or testimonials",
        "Be transparent about offer terms and conditions"
      ]
    },
    "nextSteps": [
      "1. Review the solutions provided above",
      "2. Fix the issues in your template",
      "3. Delete the rejected template",
      "4. Create a new template with corrections",
      "5. Validate before submitting (use /validate endpoint)",
      "6. Resubmit and wait for Meta approval"
    ],
    "validationEndpoint": "POST /api/whatsapp/templates/validate"
  }
}
```

**Rejection Codes & Solutions:**

#### 1. **MISLEADING_CONTENT**
   - **Cause:** False claims, fake urgency, unverified promises
   - **Solutions:**
     - Use only factual, verifiable statements
     - Remove urgency language if not genuine
     - Don't claim free items without terms
     - Avoid unsubstantiated health claims

#### 2. **POOR_QUALITY**
   - **Cause:** Low-quality media, unclear message, unprofessional presentation
   - **Solutions:**
     - Use high-quality images (HD, 1024x1024 or larger)
     - Use professional video (1080p recommended)
     - Write clear, professional message text
     - Proofread for grammar and spelling

#### 3. **INVALID_NAME**
   - **Cause:** Template name doesn't follow format rules
   - **Solutions:**
     - Use lowercase letters and underscores only
     - No spaces, hyphens, or special characters
     - Keep between 4-60 characters
     - Use descriptive, professional names

#### 4. **GRAMMAR_ISSUES**
   - **Cause:** Spelling errors, grammatical mistakes, punctuation issues
   - **Solutions:**
     - Use spell checker before submission
     - Review for proper grammar
     - Use proper punctuation and capitalization
     - Avoid excessive punctuation (!!!, ???)

#### 5. **POLICY_VIOLATION**
   - **Cause:** Content violates Meta's policies
   - **Solutions:**
     - Don't promote illegal products/services
     - Avoid discriminatory language
     - Don't encourage harassment
     - Follow local regulations
     - Don't promote adult content

#### 6. **SUSPICIOUS_LINK**
   - **Cause:** URL appears malicious or phishing
   - **Solutions:**
     - Use only trusted, verified domains
     - Avoid URL shorteners (bit.ly, tinyurl, etc.)
     - Use HTTPS URLs only
     - Ensure domain matches your business
     - Test links before submission

#### 7. **INVALID_BUTTON**
   - **Cause:** Button configuration is incorrect
   - **Solutions:**
     - Keep button text under 20 characters
     - Validate URL format (must include http:// or https://)
     - Use international phone format (+1234567890)
     - Don't use more than 3 buttons
     - Ensure button type matches config

#### 8. **EXCESSIVE_FORMATTING**
   - **Cause:** Too much special formatting (emojis, symbols, etc.)
   - **Solutions:**
     - Limit emoji use (maximum 3-4 per message)
     - Remove excessive symbols or special characters
     - Keep text professional and clean
     - Avoid ASCII art or special formatting

---

### 3. Get All Rejected Templates with Analysis

**Endpoint:** `GET /api/whatsapp/templates/rejected-analysis`

**Purpose:** See all rejected templates and recommended fixes at once.

**Request:**
```
GET /api/whatsapp/templates/rejected-analysis
Authorization: Bearer {YOUR_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "rejectedCount": 2,
  "templates": [
    {
      "template": {
        "name": "promotion_offer_2024",
        "createdAt": "2024-01-15T10:30:00Z",
        "bodyPreview": "LIMITED TIME: Get 90% OFF on all items! Only 5 LEFT IN...",
        "rejectionReason": "MISLEADING_CONTENT"
      },
      "analysis": {
        "title": "Misleading Content Detected",
        "description": "...",
        "solutions": [...]
      }
    },
    {
      "template": {
        "name": "order_confirmation",
        "createdAt": "2024-01-14T15:45:00Z",
        "bodyPreview": "Hi {{1}}, your order is confirmed!",
        "rejectionReason": "GRAMMAR_ISSUES"
      },
      "analysis": {
        "title": "Grammar & Spelling Issues",
        "description": "...",
        "solutions": [...]
      }
    }
  ],
  "tips": [
    "✅ Fix the issues according to the analysis",
    "✅ Use POST /api/whatsapp/templates/validate to check before submitting",
    "✅ Delete old rejected templates",
    "✅ Create new templates with corrections",
    "✅ Each template gets 3 chances to be approved"
  ]
}
```

---

## 🔄 Recommended Workflow

### Step 1: Create Template Locally
Prepare your template details:
```
name: order_status_update
category: TRANSACTIONAL
language: en_US
media: image.jpg (optional)
body: Order {{1}} for {{2}} is {{3}}
buttons: Track Order (URL), Cancel (QUICK_REPLY)
```

### Step 2: Validate Template
```bash
curl -X POST http://localhost:5000/api/whatsapp/templates/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "order_status_update",
    "category": "TRANSACTIONAL",
    "language": "en_US",
    "bodyText": "Order {{1}} for {{2}} is {{3}}"
  }'
```

### Step 3: Fix Issues (if any)
Review validation response and fix errors/warnings before proceeding.

### Step 4: Upload Media (if needed)
```bash
curl -X POST http://localhost:5000/api/whatsapp/templates/upload-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "mediaType=IMAGE"
```

### Step 5: Create Template with Media
```bash
curl -X POST http://localhost:5000/api/whatsapp/templates/create-with-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "order_status_update",
    "category": "TRANSACTIONAL",
    "language": "en_US",
    "mediaId": "MEDIA_ID_FROM_STEP_4",
    "mediaType": "IMAGE",
    "bodyText": "Order {{1}} for {{2}} is {{3}}",
    "buttons": [...]
  }'
```

### Step 6: Monitor Status
Template will be in PENDING status while Meta reviews. Check status with:
```bash
GET /api/whatsapp/templates/:templateId
```

### Step 7: If Rejected
Use rejection analysis endpoint to understand why:
```bash
GET /api/whatsapp/templates/analyze-rejection/{REJECTION_REASON}
```

### Step 8: Fix & Resubmit
Make corrections and create a new template. Each template gets 3 approval attempts.

---

## 📋 Best Practices

### ✅ DO's:
- ✅ Use professional, clear language
- ✅ Spell-check all text
- ✅ Test all links before submission
- ✅ Use high-quality media (HD images, 1080p video)
- ✅ Keep template names descriptive and lowercase_underscore
- ✅ Include relevant emojis (max 3-4)
- ✅ Validate before submission
- ✅ Use HTTPS URLs only

### ❌ DON'Ts:
- ❌ Don't use urgency language ("Only 1 left!", "Buy now or miss out")
- ❌ Don't make unverified claims (health, medical)
- ❌ Don't use URL shorteners
- ❌ Don't use excessive formatting or special characters
- ❌ Don't include discriminatory or abusive language
- ❌ Don't promote illegal products/services
- ❌ Don't use low-quality media
- ❌ Don't use more than 3 buttons

---

## 🧪 Testing Validation Locally

### Test with cURL:

```bash
# Validate a complete template
curl -X POST http://localhost:5000/api/whatsapp/templates/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "welcome_message",
    "category": "MARKETING",
    "language": "en_US",
    "bodyText": "Welcome {{1}}! We are excited to have you.",
    "footerText": "Messbee Customer Service",
    "buttons": [
      {
        "type": "QUICK_REPLY",
        "text": "Browse Products"
      },
      {
        "type": "URL",
        "text": "Visit Website",
        "url": "https://example.com"
      }
    ]
  }'

# Analyze rejection
curl -X GET http://localhost:5000/api/whatsapp/templates/analyze-rejection/MISLEADING_CONTENT \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all rejected templates
curl -X GET http://localhost:5000/api/whatsapp/templates/rejected-analysis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Integration with Frontend

### React Component Example:

```jsx
import React, { useState } from 'react';
import axios from 'axios';

export function TemplateValidator() {
  const [template, setTemplate] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    bodyText: ''
  });
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/whatsapp/templates/validate',
        template,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setValidation(response.data.validation);
    } catch (error) {
      console.error('Validation failed:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        value={template.name}
        onChange={(e) => setTemplate({...template, name: e.target.value})}
        placeholder="Template name (lowercase_underscore)"
      />
      
      <textarea
        value={template.bodyText}
        onChange={(e) => setTemplate({...template, bodyText: e.target.value})}
        placeholder="Template body text"
      />

      <button onClick={handleValidate} disabled={loading}>
        Validate Template
      </button>

      {validation && (
        <div>
          {validation.isValid ? (
            <div style={{color: 'green'}}>✅ Template is valid!</div>
          ) : (
            <div style={{color: 'red'}}>
              <p>❌ {validation.summary}</p>
              {validation.errors.map((error, i) => (
                <div key={i}>
                  <strong>{error.field}:</strong> {error.message}
                  <p>💡 {error.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🆘 Troubleshooting

**Issue:** Validation passes but template still gets rejected
- **Solution:** Template may have been edited after validation. Validate the exact version you're submitting. Check for whitespace changes or formatting.

**Issue:** Getting "Suspicious Link" rejection
- **Solution:** Use full HTTPS URL, no shorteners. Verify domain matches your business. Add domain to Meta Business Account whitelist.

**Issue:** "Excessive Formatting" rejection
- **Solution:** Remove excessive emojis (max 3-4), reduce special characters, keep text professional.

**Issue:** "Poor Quality" for images
- **Solution:** Use high-resolution images (1024x1024 minimum). Remove watermarks. Ensure professional presentation.

---

## 📞 Support

For additional help:
1. Check rejection analysis in this guide
2. Review Meta's official WhatsApp Business API documentation
3. Test validation endpoint with your template
4. Review best practices section above

Remember: Each template gets 3 approval attempts. Make fixes and resubmit!
