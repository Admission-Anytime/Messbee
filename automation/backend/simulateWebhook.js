import axios from 'axios';

// Ensure you run this script from the terminal: node simulateWebhook.js "1234567890" "hello"
const phone = process.argv[2] || "1234567890";
const text = process.argv[3] || "hello";

const isAd = process.argv.includes('--ad');

const payload = {
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "SIMULATED_ACCOUNT",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "Simulated_Number",
          "phone_number_id": "123456123" // This must match your Channel's activeWhatsappPhoneNumberId in DB
        },
        "contacts": [{
          "profile": { "name": "Test User" },
          "wa_id": phone
        }],
        "messages": [{
          "from": phone,
          "id": `wamid.${Date.now()}`,
          "timestamp": Math.floor(Date.now() / 1000).toString(),
          "text": { "body": text },
          "type": "text",
          ...(isAd ? {
            "referral": {
              "source_url": "https://fb.me/mock_ad_url",
              "source_id": "1234567890_mock_ad_id",
              "source_type": "ad",
              "headline": "50% Off Summer Sale!",
              "body": "Click here to claim your exclusive discount code.",
              "media_type": "image",
              "ctwa_clid": "mock_click_id_abc123"
            }
          } : {})
        }]
      },
      "field": "messages"
    }]
  }]
};

async function run() {
  try {
    console.log(`Sending simulated webhook from ${phone} saying "${text}"...`);
    const res = await axios.post('http://localhost:5001/api/webhooks/whatsapp', payload);
    console.log('Webhook accepted by backend:', res.data);
  } catch (error) {
    console.error('Webhook failed:', error.response?.data || error.message);
  }
}

run();
