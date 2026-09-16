/**
 * Messbee Official WhatsApp Conversation & Messaging Pricing Configuration
 * All base rates and retail pricing in INR (₹)
 */

const WHATSAPP_PRICING = {
  // 1. Domestic India (+91) Retail Rates charged to Client's WCC Wallet
  DOMESTIC_RATES: {
    MARKETING: 0.85,      // ₹0.85 per message (Meta base ~ ₹0.72)
    UTILITY: 0.40,        // ₹0.40 per message (Meta base ~ ₹0.308)
    AUTHENTICATION: 0.22, // ₹0.22 per message (Meta base ~ ₹0.115)
    SERVICE: 0.35,        // ₹0.35 per 24-hr session (Meta base ~ ₹0.29)
  },

  // 2. International Multipliers (applied to domestic rates by country dial code)
  INTERNATIONAL_RATES: {
    '1': { country: 'USA/Canada', rateMultiplier: 1.8 },      // ~ ₹1.53 Marketing
    '44': { country: 'United Kingdom', rateMultiplier: 4.2 },  // ~ ₹3.57 Marketing
    '971': { country: 'United Arab Emirates', rateMultiplier: 3.8 }, // ~ ₹3.23 Marketing
    '65': { country: 'Singapore', rateMultiplier: 2.5 },
    '61': { country: 'Australia', rateMultiplier: 3.0 },
    '966': { country: 'Saudi Arabia', rateMultiplier: 3.5 },
    'DEFAULT_INTERNATIONAL': 3.0 // Fallback for rest of the world
  },

  // 3. Free Tier Policies
  FREE_TIER: {
    SERVICE_CONVERSATIONS_PER_MONTH: 1000, // 1,000 free service sessions/month
  },

  // 4. Low Balance Threshold
  LOW_BALANCE_THRESHOLD: 200, // ₹200 alert threshold

  // 5. Taxes
  GST_PERCENTAGE: 18 // 18% GST on wallet top-up
};

/**
 * Helper to calculate the rate for a given message category and phone number
 */
function getMessageCost(category = 'MARKETING', phoneNumber = '') {
  const cat = String(category).toUpperCase();
  const baseRate = WHATSAPP_PRICING.DOMESTIC_RATES[cat] || WHATSAPP_PRICING.DOMESTIC_RATES.MARKETING;

  const cleanedPhone = String(phoneNumber).replace(/\D/g, '');
  
  // If Domestic India (+91 or 10 digits starting with 6-9)
  if (cleanedPhone.startsWith('91') || cleanedPhone.length === 10) {
    return baseRate;
  }

  // Check international country codes
  for (const [code, info] of Object.entries(WHATSAPP_PRICING.INTERNATIONAL_RATES)) {
    if (code !== 'DEFAULT_INTERNATIONAL' && cleanedPhone.startsWith(code)) {
      return parseFloat((baseRate * info.rateMultiplier).toFixed(3));
    }
  }

  // Fallback international multiplier
  return parseFloat((baseRate * WHATSAPP_PRICING.INTERNATIONAL_RATES.DEFAULT_INTERNATIONAL).toFixed(3));
}

module.exports = {
  WHATSAPP_PRICING,
  getMessageCost
};
