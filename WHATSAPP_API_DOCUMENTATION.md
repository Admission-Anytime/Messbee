# 📱 WhatsApp Business Cloud API - Complete Documentation

## 🔑 Your Credentials
- **Business Name:** Messbee
- **WABA ID:** 1612193906402010
- **Phone Number ID:** 938016822738928
- **App ID:** 1401700501230008
- **API Version:** v18.0 (Phone Number), v23.0 (WABA)

---

## 📚 Table of Contents
1. [Messaging APIs](#1-messaging-apis)
2. [Message Templates](#2-message-templates)
3. [Media Management](#3-media-management)
4. [Business Profile Management](#4-business-profile-management)
5. [Webhooks & Notifications](#5-webhooks--notifications)
6. [Contact Management](#6-contact-management)
7. [Commerce & Products](#7-commerce--products)
8. [QR Codes](#8-qr-codes)
9. [Analytics & Reporting](#9-analytics--reporting)
10. [Phone Number Management](#10-phone-number-management)
11. [WhatsApp Flows](#11-whatsapp-flows)
12. [Payment Integration](#12-payment-integration)
13. [Additional Features](#13-additional-features)

---

## 1. 📨 Messaging APIs

### A. Send Text Messages
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/messages

{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "text",
  "text": {
    "body": "Hello from Messbee!"
  }
}
```

**Features:**
- Send simple text messages
- Support for emojis
- Preview URLs
- Message length up to 4096 characters

### B. Send Media Messages

#### 📷 Images
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Check out this image!"
  }
}
```

#### 🎥 Videos
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "video",
  "video": {
    "link": "https://example.com/video.mp4",
    "caption": "Watch this video!"
  }
}
```

#### 📄 Documents
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "document",
  "document": {
    "link": "https://example.com/document.pdf",
    "filename": "Invoice.pdf",
    "caption": "Your invoice"
  }
}
```

#### 🎵 Audio
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "audio",
  "audio": {
    "link": "https://example.com/audio.mp3"
  }
}
```

#### 📍 Location
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "location",
  "location": {
    "latitude": "28.6139",
    "longitude": "77.2090",
    "name": "Connaught Place",
    "address": "New Delhi, India"
  }
}
```

#### 👤 Contact Card
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "contacts",
  "contacts": [{
    "name": {
      "formatted_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "phones": [{
      "phone": "+911234567890",
      "type": "MOBILE"
    }]
  }]
}
```

### C. Interactive Messages

#### Buttons (up to 3 buttons)
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "Choose an option:"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_1",
            "title": "Option 1"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_2",
            "title": "Option 2"
          }
        }
      ]
    }
  }
}
```

#### List Messages (up to 10 items)
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "interactive",
  "interactive": {
    "type": "list",
    "header": {
      "type": "text",
      "text": "Our Services"
    },
    "body": {
      "text": "Select a service:"
    },
    "action": {
      "button": "View Options",
      "sections": [
        {
          "title": "Services",
          "rows": [
            {
              "id": "service_1",
              "title": "Service 1",
              "description": "Description of service 1"
            },
            {
              "id": "service_2",
              "title": "Service 2",
              "description": "Description of service 2"
            }
          ]
        }
      ]
    }
  }
}
```

### D. Message Actions

#### Mark Message as Read
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/messages

{
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": "wamid.XXX"
}
```

#### Reply to a Message
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "context": {
    "message_id": "wamid.XXX"
  },
  "type": "text",
  "text": {
    "body": "This is a reply!"
  }
}
```

#### React to a Message
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "reaction",
  "reaction": {
    "message_id": "wamid.XXX",
    "emoji": "👍"
  }
}
```

---

## 2. 📝 Message Templates

### Types of Templates:

#### A. Marketing Templates
- Promotional messages
- Announcements
- Newsletters
- Product launches

#### B. Utility Templates
- Order confirmations
- Appointment reminders
- Shipping notifications
- Account updates

#### C. Authentication Templates (OTP)
- One-time passwords
- Verification codes
- Two-factor authentication

### Create Template
```javascript
POST https://graph.facebook.com/v23.0/1612193906402010/message_templates

{
  "name": "order_confirmation",
  "language": "en",
  "category": "UTILITY",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Order Confirmed! 🎉"
    },
    {
      "type": "BODY",
      "text": "Hi {{1}}, your order #{{2}} has been confirmed. Total: ₹{{3}}"
    },
    {
      "type": "FOOTER",
      "text": "Thank you for shopping with Messbee"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "URL",
          "text": "Track Order",
          "url": "https://messbee.com/track/{{1}}"
        },
        {
          "type": "PHONE_NUMBER",
          "text": "Call Support",
          "phone_number": "+911234567890"
        }
      ]
    }
  ]
}
```

### Send Template Message
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/messages

{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "template",
  "template": {
    "name": "order_confirmation",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "John"
          },
          {
            "type": "text",
            "text": "12345"
          },
          {
            "type": "text",
            "text": "1999"
          }
        ]
      }
    ]
  }
}
```

### Get All Templates
```javascript
GET https://graph.facebook.com/v23.0/1612193906402010/message_templates
```

### Delete Template
```javascript
DELETE https://graph.facebook.com/v23.0/1612193906402010/message_templates?name=template_name
```

---

## 3. 🎬 Media Management

### Supported Media Types:
| Media Type | Formats | Max Size |
|------------|---------|----------|
| **Image** | JPEG, PNG | 5 MB |
| **Video** | MP4, 3GP | 16 MB |
| **Audio** | AAC, MP3, AMR, OGG | 16 MB |
| **Document** | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT | 100 MB |
| **Sticker** | WEBP | 100 KB |

### A. Upload Media
```javascript
// Step 1: Create Upload Session
POST https://graph.facebook.com/v18.0/1401700501230008/uploads

{
  "file_length": 12345,
  "file_type": "image/jpeg"
}

// Step 2: Upload File
POST {upload_url}
Content-Type: image/jpeg
file_offset: 0

[Binary File Data]
```

### B. Get Media URL
```javascript
GET https://graph.facebook.com/v18.0/{media_id}

// Response:
{
  "url": "https://media.example.com/file.jpg",
  "mime_type": "image/jpeg",
  "file_size": 12345
}
```

### C. Download Media
```javascript
GET {media_url}
Authorization: Bearer {access_token}
```

### D. Delete Media
```javascript
DELETE https://graph.facebook.com/v18.0/{media_id}
```

---

## 4. 🏢 Business Profile Management

### Get Business Profile
```javascript
GET https://graph.facebook.com/v18.0/938016822738928?fields=business_profile
```

### Update Business Profile
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/whatsapp_business_profile

{
  "messaging_product": "whatsapp",
  "about": "Welcome to Messbee - Your messaging solution",
  "address": "123 Business Street, Delhi",
  "description": "We provide messaging services",
  "email": "support@messbee.com",
  "profile_picture_handle": "{media_handle}",
  "vertical": "PROFESSIONAL_SERVICES",
  "websites": ["https://messbee.com"]
}
```

### Available Fields:
- **about**: Business description (max 139 chars)
- **address**: Business address
- **description**: Detailed description (max 512 chars)
- **email**: Contact email
- **profile_picture_handle**: Profile photo
- **vertical**: Business category
- **websites**: Website URLs

---

## 5. 🔔 Webhooks & Notifications

### Setup Webhooks
1. Configure webhook URL in Meta App Dashboard
2. Subscribe to WABA webhooks

```javascript
POST https://graph.facebook.com/v23.0/1612193906402010/subscribed_apps
```

### Webhook Events You'll Receive:

#### A. Message Received
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "messages": [{
          "from": "911234567890",
          "id": "wamid.XXX",
          "timestamp": "1234567890",
          "type": "text",
          "text": {
            "body": "Hello!"
          }
        }]
      }
    }]
  }]
}
```

#### B. Message Status Updates
- **sent**: Message sent to WhatsApp servers
- **delivered**: Message delivered to recipient's device
- **read**: Message read by recipient
- **failed**: Message failed to deliver

```json
{
  "statuses": [{
    "id": "wamid.XXX",
    "status": "delivered",
    "timestamp": "1234567890",
    "recipient_id": "911234567890"
  }]
}
```

#### C. Interactive Message Reply
```json
{
  "messages": [{
    "type": "interactive",
    "interactive": {
      "type": "button_reply",
      "button_reply": {
        "id": "btn_1",
        "title": "Option 1"
      }
    }
  }]
}
```

---

## 6. 👥 Contact Management

### Features:

#### A. Save Contacts
WhatsApp automatically saves contacts when users message you

#### B. Get Contact Info
```javascript
GET https://graph.facebook.com/v18.0/938016822738928/contacts
```

#### C. Block/Unblock Users

**Block User:**
```javascript
POST https://graph.facebook.com/v18.0/938016822738928

{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "action": "block"
}
```

**Unblock User:**
```javascript
POST https://graph.facebook.com/v18.0/938016822738928

{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "action": "unblock"
}
```

---

## 7. 🛍️ Commerce & Products

### A. Enable Commerce Settings
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/whatsapp_commerce_settings

{
  "is_catalog_visible": true,
  "is_cart_enabled": true
}
```

### B. Send Product Messages

#### Single Product
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "interactive",
  "interactive": {
    "type": "product",
    "body": {
      "text": "Check out this product!"
    },
    "action": {
      "catalog_id": "{catalog_id}",
      "product_retailer_id": "{product_id}"
    }
  }
}
```

#### Multiple Products
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "interactive",
  "interactive": {
    "type": "product_list",
    "header": {
      "type": "text",
      "text": "Our Products"
    },
    "body": {
      "text": "Browse our collection"
    },
    "action": {
      "catalog_id": "{catalog_id}",
      "sections": [
        {
          "title": "Featured Products",
          "product_items": [
            {"product_retailer_id": "product_1"},
            {"product_retailer_id": "product_2"}
          ]
        }
      ]
    }
  }
}
```

### C. Cart & Order Management
- Customers can add products to cart
- Send cart summary
- Process orders via webhooks

---

## 8. 📱 QR Codes

### Create QR Code
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/message_qrdls

{
  "prefilled_message": "Hello Messbee!",
  "generate_qr_image": "PNG"
}
```

### Get QR Code
```javascript
GET https://graph.facebook.com/v18.0/{qr_code_id}?fields=code,prefilled_message,deep_link_url
```

### Get QR Image URL
```javascript
GET https://graph.facebook.com/v18.0/{qr_code_id}?fields=qr_image_url
```

### Update QR Code
```javascript
POST https://graph.facebook.com/v18.0/{qr_code_id}

{
  "prefilled_message": "New message"
}
```

### Delete QR Code
```javascript
DELETE https://graph.facebook.com/v18.0/{qr_code_id}
```

---

## 9. 📊 Analytics & Reporting

### Get Analytics
```javascript
GET https://graph.facebook.com/v23.0/1612193906402010/analytics
  ?start=1640995200
  &end=1643673600
  &granularity=DAY
  &metric_types=SENT,DELIVERED,READ
```

### Available Metrics:
- **SENT**: Total messages sent
- **DELIVERED**: Total messages delivered
- **READ**: Total messages read
- **RECEIVED**: Total messages received
- **COST**: Cost of messages

### Conversation Analytics
```javascript
GET https://graph.facebook.com/v23.0/1612193906402010/conversation_analytics
  ?start=1640995200
  &end=1643673600
  &granularity=DAILY
  &conversation_type=REGULAR,BUSINESS_INITIATED
```

### Conversation Types:
- **USER_INITIATED**: Customer starts conversation (Free for 24h)
- **BUSINESS_INITIATED**: Business starts with template (Charged)
- **REFERRAL_CONVERSION**: Through ads
- **SERVICE**: Customer service conversations
- **UTILITY**: Transaction updates
- **AUTHENTICATION**: OTP messages
- **MARKETING**: Promotional messages

---

## 10. ☎️ Phone Number Management

### Register Phone Number
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/register

{
  "messaging_product": "whatsapp",
  "pin": "123456"  // 6-digit PIN for two-step verification
}
```

### Get Phone Number Details
```javascript
GET https://graph.facebook.com/v18.0/938016822738928
  ?fields=verified_name,display_phone_number,quality_rating
```

### Request Verification Code
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/request_code

{
  "code_method": "SMS",  // or "VOICE"
  "locale": "en_US"
}
```

### Verify Code
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/verify_code

{
  "code": "123456"
}
```

### Quality Rating
Your phone number has a quality rating:
- **GREEN**: High quality
- **YELLOW**: Medium quality
- **RED**: Low quality (message limit reduced)
- **NA**: New number, not yet rated

---

## 11. 🔄 WhatsApp Flows

Create interactive forms and workflows within WhatsApp chat.

### Use Cases:
- Customer surveys
- Lead generation forms
- Appointment booking
- Product customization
- Order forms
- Feedback collection

### Create Flow
```javascript
POST https://graph.facebook.com/v18.0/1612193906402010/flows

{
  "name": "Customer Feedback Form",
  "categories": ["SURVEY"]
}
```

### Send Flow Message
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "header": {
      "type": "text",
      "text": "Feedback Form"
    },
    "body": {
      "text": "We'd love your feedback!"
    },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_id": "{flow_id}",
        "flow_cta": "Start Survey",
        "flow_action": "navigate"
      }
    }
  }
}
```

---

## 12. 💳 Payment Integration

### Supported Countries:
- **India (IN)**: UPI, Cards
- **Singapore (SG)**: PayNow, Cards

### Send Payment Request (India)
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "interactive",
  "interactive": {
    "type": "order_details",
    "body": {
      "text": "Complete your payment"
    },
    "action": {
      "name": "review_and_pay",
      "parameters": {
        "reference_id": "ORDER123",
        "type": "digital-goods",
        "payment_type": "upi",
        "currency": "INR",
        "total_amount": {
          "value": 1999,
          "offset": 100
        },
        "order": {
          "items": [
            {
              "name": "Product 1",
              "amount": {
                "value": 1999,
                "offset": 100
              },
              "quantity": 1
            }
          ]
        }
      }
    }
  }
}
```

---

## 13. 🎯 Additional Features

### A. Typing Indicators
```javascript
POST https://graph.facebook.com/v18.0/938016822738928/messages

{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "typing",
  "typing": {
    "status": "on"  // or "off"
  }
}
```

### B. Stickers
```javascript
{
  "messaging_product": "whatsapp",
  "to": "911234567890",
  "type": "sticker",
  "sticker": {
    "link": "https://example.com/sticker.webp"
  }
}
```

### C. Message Limits

**Conversation Windows:**
- **24-hour window**: After customer messages, you have 24h to respond freely
- **Beyond 24h**: Must use approved templates

**Rate Limits:**
- Tier 1: 1,000 conversations/day
- Tier 2: 10,000 conversations/day
- Tier 3: 100,000 conversations/day
- Tier 4: Unlimited

**Quality-Based Limits:**
- **GREEN**: Full messaging limit
- **YELLOW**: Limit reduced to 50% of current tier
- **RED**: Limit reduced to 1,000 conversations/day

---

## 🔐 Security Best Practices

1. **Access Tokens:**
   - Never expose tokens in client-side code
   - Rotate tokens regularly
   - Use System User tokens for production

2. **Webhooks:**
   - Verify webhook signatures
   - Use HTTPS endpoints only
   - Implement retry logic

3. **Data Privacy:**
   - Follow GDPR/data protection laws
   - Don't store WhatsApp profile data
   - Respect opt-outs

4. **Rate Limiting:**
   - Implement exponential backoff
   - Monitor error responses
   - Cache frequently accessed data

---

## 📈 Pricing Model

### Conversation-Based Pricing:
- **User-Initiated**: FREE for first 24 hours
- **Business-Initiated**: Charged per conversation
- **Marketing**: Higher cost
- **Utility**: Lower cost
- **Authentication**: Lowest cost
- **Service**: Customer service rate

### Free Tier:
- 1,000 free conversations/month
- Across all conversations types

---

## 🛠️ Implementation in Messbee

### Recommended Architecture:

```
Client (React)
    ↓
Express Server (Node.js)
    ↓
WhatsApp Service Layer
    ↓
WhatsApp Cloud API
```

### Key Files to Create/Update:

1. **server/services/whatsappService.js**
   - Send messages
   - Upload media
   - Manage templates

2. **server/controllers/whatsappController.js**
   - Handle webhook events
   - Process incoming messages
   - Send responses

3. **server/routes/whatsappRoutes.js**
   - Webhook endpoint
   - Message sending endpoints

4. **server/config/whatsapp.js**
   - Store credentials
   - API configuration

---

## 📞 Support & Resources

- **Documentation**: https://developers.facebook.com/docs/whatsapp
- **API Reference**: https://developers.facebook.com/docs/whatsapp/cloud-api/reference
- **WhatsApp Manager**: https://business.facebook.com/wa/manage/home/
- **App Dashboard**: https://developers.facebook.com/apps/1401700501230008

---

## ✅ Next Steps for Messbee

1. ✅ Setup webhook endpoint
2. ✅ Implement message sending
3. ✅ Create message templates
4. ✅ Setup media upload
5. ✅ Integrate with existing chat system
6. ✅ Add contact management
7. ✅ Setup analytics tracking
8. ✅ Test QR code generation
9. ✅ Implement business profile
10. ✅ Add commerce features (if needed)

---

**Last Updated:** March 5, 2026
**API Version:** v18.0 (Messages), v23.0 (Management)
