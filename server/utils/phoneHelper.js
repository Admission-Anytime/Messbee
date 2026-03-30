/**
 * Phone Number Helper Utilities
 * Handles phone number normalization and validation
 */

/**
 * Normalize phone number for WhatsApp API
 * @param {string} phone - Phone number in any format
 * @param {string} defaultCountryCode - Default country code (default: '91' for India)
 * @returns {string} - Normalized phone number with country code
 */
function normalizePhoneNumber(phone, defaultCountryCode = '91') {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  let cleanPhone = phone.toString().replace(/[^0-9]/g, '');
  
  // If phone already has country code (12 digits starting with 91), return as is
  if (cleanPhone.length === 12 && cleanPhone.startsWith(defaultCountryCode)) {
    return cleanPhone;
  }
  
  // If phone has 10 digits and doesn't start with country code, add it
  if (cleanPhone.length === 10) {
    cleanPhone = defaultCountryCode + cleanPhone;
  }
  
  // If phone has 11 digits and starts with 0, remove the 0 and add country code
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = defaultCountryCode + cleanPhone.substring(1);
  }
  
  return cleanPhone;
}

/**
 * Validate if phone number is valid for WhatsApp
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhoneNumber(phone) {
  const normalized = normalizePhoneNumber(phone);
  
  // Should be 12 digits for Indian numbers (91 + 10 digits)
  // Adjust this validation based on your target countries
  return normalized.length >= 10 && normalized.length <= 15;
}

/**
 * Compare two phone numbers for equality
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} - True if phones are the same
 */
function phoneNumbersMatch(phone1, phone2) {
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  return normalized1 === normalized2;
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  const normalized = normalizePhoneNumber(phone);
  
  // Format as: +91 99999 99999
  if (normalized.length === 12 && normalized.startsWith('91')) {
    return `+${normalized.substring(0, 2)} ${normalized.substring(2, 7)} ${normalized.substring(7)}`;
  }
  
  return `+${normalized}`;
}

module.exports = {
  normalizePhoneNumber,
  isValidPhoneNumber,
  phoneNumbersMatch,
  formatPhoneNumber
};
