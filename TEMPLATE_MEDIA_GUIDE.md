# WhatsApp Template Creation with Media Support

## Overview
Complete system for creating WhatsApp templates with images, videos, and documents. Templates get Meta approval automatically and can be used for campaigns.

---

## ✅ What's Implemented

### 1. **Enhanced Database Model** (`server/models/Template.js`)
- Media header support (IMAGE, VIDEO, DOCUMENT)
- Template status tracking (PENDING, APPROVED, REJECTED, DISABLED)
- Rejection reason tracking
- Quality score monitoring
- Indexed for fast queries

### 2. **Service Methods** (`server/services/whatsappService.js`)
- `buildMediaHeaderComponent()` - Create media headers
- `buildBodyComponent()` - Create message body
- `buildFooterComponent()` - Add footer text
- `buildButtonsComponent()` - Add action buttons
- `createTemplateWithMedia()` - Complete template creation with media

### 3. **API Endpoints** 

#### Upload Media
```
POST /api/whatsapp/templates/upload-media
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

Body:
- file: (binary image/video/document)
- mediaType: IMAGE|VIDEO|DOCUMENT

Response:
{
  "success": true,
  "data": {
    "mediaId": "wamid.xxxxx",
    "mediaType": "IMAGE",
    "mimeType": "image/jpeg",
    "fileName": "campaign.jpg",
    "fileSize": 52428
  }
}
```

#### Create Template with Media
```
POST /api/whatsapp/templates/create-with-media
Content-Type: application/json
Authorization: Bearer TOKEN

Body:
{
  "name": "summer_sale_template",
  "category": "MARKETING",
  "language": "en_US",
  "mediaType": "IMAGE",
  "mediaId": "wamid.xxxxx",
  "bodyText": "Check out our summer sale! Use code SUMMER50 for 50% off.",
  "footerText": "Valid until June 30",
  "buttons": [
    {
      "type": "URL",
      "text": "Shop Now",
      "url": "https://yoursite.com/sale"
    },
    {
      "type": "QUICK_REPLY",
      "text": "Interested"
    },
    {
      "type": "PHONE_NUMBER",
      "text": "Call Us",
      "phone_number": "+1234567890"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Template with media created successfully and sent for approval",
  "data": {
    "template": { ... },
    "status": "PENDING_APPROVAL",
    "nextSteps": [
      "1. Template submitted to Meta for approval",
      "2. Approval typically takes 5-30 minutes",
      "3. You will receive notification when approved",
      "4. Once approved, you can use it in campaigns"
    ]
  }
}
```

#### Check Template Status
```
GET /api/whatsapp/templates/media/:templateId/details
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "summer_sale_template",
    "status": "APPROVED",
    "category": "MARKETING",
    "language": "en_US",
    "mediaHeader": {
      "type": "IMAGE",
      "mediaId": "wamid.xxxxx",
      "mimeType": "image/jpeg"
    },
    "bodyText": "Check out our summer sale!...",
    "buttonCount": 3,
    "qualityScore": 95,
    "createdAt": "2024-05-09T10:30:00.000Z"
  }
}
```

#### List All Media Templates
```
GET /api/whatsapp/templates/media/list?status=APPROVED&category=MARKETING
Authorization: Bearer TOKEN

Response:
{
  "success": true,
  "summary": {
    "total": 5,
    "approved": 3,
    "pending": 1,
    "rejected": 1
  },
  "data": [
    {
      "_id": "...",
      "name": "summer_sale_template",
      "status": "APPROVED",
      "bodyText": "Check out our summer sale!...",
      "buttonCount": 3,
      "createdAt": "2024-05-09T10:30:00.000Z"
    }
  ]
}
```

---

## 🚀 Frontend Implementation

### Step 1: Upload Image Component

```javascript
import axios from 'axios';

const uploadImageForTemplate = async (file, mediaType = 'IMAGE') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);

    const response = await axios.post(
      '/api/whatsapp/templates/upload-media',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data.data; // Returns { mediaId, mediaType, mimeType, ... }
  } catch (error) {
    console.error('Upload failed:', error.response?.data?.message);
    throw error;
  }
};
```

### Step 2: Template Creation Component

```javascript
const createTemplateWithMedia = async (templateData) => {
  try {
    const response = await axios.post(
      '/api/whatsapp/templates/create-with-media',
      {
        name: templateData.name,
        category: templateData.category || 'MARKETING',
        language: templateData.language || 'en_US',
        mediaType: templateData.mediaType, // From upload step
        mediaId: templateData.mediaId,     // From upload step
        bodyText: templateData.bodyText,
        footerText: templateData.footerText || '',
        buttons: templateData.buttons || []
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Template creation failed:', error.response?.data?.message);
    throw error;
  }
};
```

### Step 3: Status Checker Component

```javascript
const checkTemplateStatus = async (templateId) => {
  try {
    const response = await axios.get(
      `/api/whatsapp/templates/media/${templateId}/details`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const template = response.data.data;
    
    return {
      id: template._id,
      name: template.name,
      status: template.status,      // PENDING, APPROVED, REJECTED
      rejectionReason: template.rejectionReason,
      qualityScore: template.qualityScore,
      bodyPreview: template.bodyText.substring(0, 100) + '...'
    };
  } catch (error) {
    console.error('Status check failed:', error.response?.data?.message);
    throw error;
  }
};
```

### Step 4: Template List Component

```javascript
const getApprovedTemplates = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.language) params.append('language', filters.language);

    const response = await axios.get(
      `/api/whatsapp/templates/media/list?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch templates:', error.response?.data?.message);
    throw error;
  }
};
```

---

## 📱 Complete Workflow Example

```javascript
// Complete step-by-step implementation

async function createAndSendTemplateWithMedia() {
  try {
    // Step 1: User selects image file
    const imageFile = document.getElementById('imageInput').files[0];

    // Step 2: Upload image to WhatsApp
    console.log('📤 Uploading image...');
    const uploadedMedia = await uploadImageForTemplate(imageFile, 'IMAGE');
    console.log('✅ Image uploaded:', uploadedMedia.mediaId);

    // Step 3: Create template with media
    console.log('📋 Creating template...');
    const templateResult = await createTemplateWithMedia({
      name: 'summer_sale_2024',
      category: 'MARKETING',
      language: 'en_US',
      mediaType: uploadedMedia.mediaType,
      mediaId: uploadedMedia.mediaId,
      bodyText: 'Summer Sale 2024! Get 50% off on all items. Use code: SUMMER50',
      footerText: 'Valid till June 30, 2024',
      buttons: [
        {
          type: 'URL',
          text: 'Shop Now',
          url: 'https://yourstore.com/sale'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Interested'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Not Now'
        }
      ]
    });

    console.log('✅ Template created:', templateResult.data.template._id);

    // Step 4: Poll status every 10 seconds
    const templateId = templateResult.data.template._id;
    let isApproved = false;
    let attempts = 0;

    while (!isApproved && attempts < 18) { // 3 minutes max
      attempts++;
      console.log(`⏳ Checking approval status (${attempts}/18)...`);
      
      const status = await checkTemplateStatus(templateId);
      
      if (status.status === 'APPROVED') {
        console.log('✅ Template approved! Ready to use.');
        isApproved = true;
        return status;
      } else if (status.status === 'REJECTED') {
        console.error('❌ Template rejected:', status.rejectionReason);
        throw new Error('Template rejection: ' + status.rejectionReason);
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    if (!isApproved) {
      console.warn('⏱️ Approval still pending. Continue checking later.');
    }

  } catch (error) {
    console.error('❌ Error in workflow:', error.message);
  }
}
```

---

## 🎨 Supported Button Types

### 1. Quick Reply Buttons
```javascript
{
  type: 'QUICK_REPLY',
  text: 'Click me'  // Max 20 characters
}
```

### 2. Call Button
```javascript
{
  type: 'PHONE_NUMBER',
  text: 'Call Support',
  phone_number: '+1234567890'  // Must include country code
}
```

### 3. URL Button
```javascript
{
  type: 'URL',
  text: 'Shop Now',
  url: 'https://yoursite.com/sale'  // Must start with http/https
}
```

---

## 📸 Media Format Specifications

### Images
- **Formats**: JPG, PNG, GIF, WebP
- **Max Size**: 25MB
- **Recommended**: 1200x628px
- **Aspect Ratio**: 1.91:1

### Videos
- **Formats**: MP4, MOV, AVI, 3GP
- **Max Size**: 25MB
- **Duration**: Max 60 seconds
- **Codec**: H.264

### Documents
- **Formats**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Max Size**: 25MB
- **Pages**: Max 10 pages recommended

---

## ⚡ Best Practices

### Template Naming
- Use lowercase with underscores: `summer_sale_2024`
- Be descriptive: `winter_promotion_jan_2024`
- Avoid special characters

### Content
- Keep body text under 1024 characters
- Use clear, concise language
- Add emojis for visual appeal
- Test with different languages

### Approval Tips
✅ Use high-quality images
✅ Clear, relevant content
✅ Professional appearance
✅ No misleading information
✅ Compliant with WhatsApp policies

❌ Avoid poor quality images
❌ Misleading content
❌ Excessive formatting
❌ Broken links in buttons

### Testing
```bash
# Test upload
curl -X POST http://localhost:3000/api/whatsapp/templates/upload-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "mediaType=IMAGE"

# Test template creation
curl -X POST http://localhost:3000/api/whatsapp/templates/create-with-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_template",
    "category": "MARKETING",
    "language": "en_US",
    "mediaType": "IMAGE",
    "mediaId": "wamid.xxxxx",
    "bodyText": "Test message",
    "buttons": []
  }'
```

---

## 🔄 Using Templates in Campaigns

Once approved, use templates in your campaigns:

```javascript
// Send template to contacts
const sendTemplateToContact = async (phoneNumber, templateName) => {
  const response = await axios.post(
    '/api/whatsapp/send-template',
    {
      to: phoneNumber,
      templateName: templateName,
      languageCode: 'en_US'
    },
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  return response.data;
};

// Send to multiple contacts
const sendTemplateToContacts = async (phoneNumbers, templateName) => {
  const results = await Promise.all(
    phoneNumbers.map(phone => sendTemplateToContact(phone, templateName))
  );

  return results;
};
```

---

## 📊 Status Flow

```
┌─────────────────────────────────────────┐
│     USER CREATES TEMPLATE               │
│   (Image + Text + Buttons)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ PENDING       │  (Waiting for Meta approval)
         │ ~5-30 minutes │
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌────────┐      ┌──────────┐
    │APPROVED│      │ REJECTED │
    │        │      │ (show    │
    │ Ready  │      │  reason) │
    │  for   │      └──────────┘
    │Campaign│         │
    └────┬───┘         │
         │          (Retry with
         │           changes)
         │             │
         └─────┬───────┘
               │
               ▼
         ┌───────────────┐
         │ SEND TO       │
         │ CONTACTS      │
         │ (Campaigns)   │
         └───────────────┘
```

---

## 🆘 Troubleshooting

### Template Upload Fails
- **Check file size** - Max 25MB
- **Check format** - Supported: JPG, PNG, GIF, WebP for images
- **Check connection** - Ensure WhatsApp API token is valid

### Template Approval Takes Too Long
- **Normal wait**: 5-30 minutes
- **Extended wait**: Quality issues detected, review content
- **Check rejection reason** in template details

### Buttons Not Working
- **Max 3 buttons** per template
- **Quick Reply**: Max 20 characters
- **URL**: Must start with http:// or https://
- **Phone**: Must include country code (+1, +91, etc.)

### Media Not Showing
- Ensure mediaId is correct and uploaded
- Check media type matches (IMAGE, VIDEO, DOCUMENT)
- Verify media hasn't expired (WhatsApp stores for 30 days)

---

## 📝 Database Fields Reference

```javascript
Template Schema:
{
  name: String,                  // Template name (unique per user)
  whatsappTemplateId: String,    // ID from Meta
  category: String,              // MARKETING, OTP, TRANSACTIONAL
  language: String,              // en_US, hi_IN, etc.
  status: String,                // PENDING, APPROVED, REJECTED, DISABLED
  rejectionReason: String,       // Why template was rejected
  components: Array,             // WhatsApp components (HEADER, BODY, etc.)
  
  mediaHeader: {
    type: String,                // IMAGE, VIDEO, DOCUMENT
    mediaId: String,             // WhatsApp media ID
    url: String,                 // Media URL
    mimeType: String,            // image/jpeg, video/mp4, etc.
    localPath: String,           // Server file path
    uploadedAt: Date
  },
  
  headerText: String,            // Optional header text
  bodyText: String,              // Message body
  footerText: String,            // Optional footer
  buttonCount: Number,           // Number of buttons
  qualityScore: Number,          // Meta quality rating (0-100)
  lastSyncedAt: Date,            // Last status sync from Meta
  
  user: ObjectId,                // Template owner
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Next Steps

1. **Integrate into your UI** - Create upload and template builder forms
2. **Add real-time notifications** - Notify users when templates are approved
3. **Build template library** - Show approved templates for reuse
4. **Add webhook handler** - Listen for Meta approval notifications
5. **Create campaign builder** - Send approved templates to contact lists

Good luck! Templates with media significantly improve engagement! 🚀
