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
 * Helper to calculate the rate for a given message category and phone number.
 * Supports optional client-specific custom pricing override.
 *
 * @param {string} category - MARKETING | UTILITY | AUTHENTICATION | SERVICE
 * @param {string} phoneNumber - Recipient phone number (domestic or international)
 * @param {object|null} customPricing - Optional custom pricing object or rates
 * @returns {number} Cost in INR (₹)
 */
function getMessageCost(category = 'MARKETING', phoneNumber = '', customPricing = null) {
  const cat = String(category).toUpperCase();
  const catLower = cat.toLowerCase();

  // 1. Resolve base rate: check custom pricing first, then fall back to default
  let baseRate = null;
  if (customPricing) {
    const isEnabled = customPricing.enabled !== false;
    const rates = customPricing.rates || (customPricing.customPricing ? customPricing.customPricing.rates : customPricing);

    if (isEnabled && rates && typeof rates === 'object') {
      const customVal = rates[catLower] != null ? rates[catLower] : rates[cat];
      if (customVal != null && !isNaN(Number(customVal)) && Number(customVal) >= 0) {
        baseRate = Number(customVal);
      }
    }
  }

  // 2. Fallback to default domestic Meta rate if no valid custom rate found
  if (baseRate == null) {
    baseRate = WHATSAPP_PRICING.DOMESTIC_RATES[cat] || WHATSAPP_PRICING.DOMESTIC_RATES.MARKETING;
  }

  const rawPhone = String(phoneNumber).trim();
  const hasPlus = rawPhone.startsWith('+');
  const cleanedPhone = rawPhone.replace(/\D/g, '');

  // 1. Explicit domestic India +91 or 91XXXXXXXXXX (12 digits)
  if (cleanedPhone.startsWith('91') && cleanedPhone.length === 12) {
    return baseRate;
  }

  // 2. Check known international country codes
  const internationalCodes = Object.entries(WHATSAPP_PRICING.INTERNATIONAL_RATES)
    .filter(([code]) => code !== 'DEFAULT_INTERNATIONAL')
    .sort((a, b) => b[0].length - a[0].length);

  for (const [code, info] of internationalCodes) {
    if (cleanedPhone.startsWith(code)) {
      if (code === '1' && cleanedPhone.length !== 11 && !hasPlus) continue;
      if (code === '65' && cleanedPhone.length === 10) {
        return parseFloat((baseRate * info.rateMultiplier).toFixed(3));
      }
      if (code === '971' && (cleanedPhone.length === 12 || hasPlus)) {
        return parseFloat((baseRate * info.rateMultiplier).toFixed(3));
      }
      if (hasPlus || cleanedPhone.length > 10) {
        return parseFloat((baseRate * info.rateMultiplier).toFixed(3));
      }
    }
  }

  // 3. 10-digit domestic Indian mobile number (starts with 6, 7, 8, 9 except 65)
  if (cleanedPhone.length === 10 && /^[6-9]/.test(cleanedPhone) && !cleanedPhone.startsWith('65')) {
    return baseRate;
  }

  // 4. Any other matching international code
  for (const [code, info] of internationalCodes) {
    if (cleanedPhone.startsWith(code)) {
      return parseFloat((baseRate * info.rateMultiplier).toFixed(3));
    }
  }

  // 5. Fallback international multiplier
  return parseFloat((baseRate * WHATSAPP_PRICING.INTERNATIONAL_RATES.DEFAULT_INTERNATIONAL).toFixed(3));
}

/**
 * Helper to generate pricing summary (defaults, custom, effective) for admin view
 */
function getClientPricingSummary(customPricing = null) {
  const isCustomEnabled = Boolean(customPricing && customPricing.enabled);
  const customRates = isCustomEnabled ? (customPricing.rates || {}) : {};

  const defaultRates = {
    marketing: WHATSAPP_PRICING.DOMESTIC_RATES.MARKETING,
    utility: WHATSAPP_PRICING.DOMESTIC_RATES.UTILITY,
    authentication: WHATSAPP_PRICING.DOMESTIC_RATES.AUTHENTICATION,
    service: WHATSAPP_PRICING.DOMESTIC_RATES.SERVICE,
  };

  const effectiveRates = {
    marketing: customRates.marketing != null ? Number(customRates.marketing) : defaultRates.marketing,
    utility: customRates.utility != null ? Number(customRates.utility) : defaultRates.utility,
    authentication: customRates.authentication != null ? Number(customRates.authentication) : defaultRates.authentication,
    service: customRates.service != null ? Number(customRates.service) : defaultRates.service,
  };

  return {
    isCustomEnabled,
    defaultRates,
    customRates: {
      marketing: customRates.marketing ?? null,
      utility: customRates.utility ?? null,
      authentication: customRates.authentication ?? null,
      service: customRates.service ?? null,
    },
    effectiveRates
  };
}

module.exports = {
  WHATSAPP_PRICING,
  getMessageCost,
  getClientPricingSummary
};
