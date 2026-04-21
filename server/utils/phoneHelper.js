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
  
  let cleanPhone = phone.toString().trim();

  // Strip leading + if present (international format indicator)
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Remove all remaining non-numeric characters (spaces, dashes, parentheses)
  cleanPhone = cleanPhone.replace(/[^0-9]/g, '');

  if (!cleanPhone) return '';

  // If already has valid country code prefix and correct total length, return as-is
  // (e.g., 919119943301 = 91 + 10 digits = 12 digits)
  if (
    cleanPhone.startsWith(defaultCountryCode) &&
    cleanPhone.length === defaultCountryCode.length + 10
  ) {
    return cleanPhone;
  }

  // If exactly 10 digits, prepend the default country code
  if (cleanPhone.length === 10) {
    return defaultCountryCode + cleanPhone;
  }

  // If 11 digits starting with '0', strip leading 0 and prepend country code
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    return defaultCountryCode + cleanPhone.substring(1);
  }

  // For all other lengths (international or already full), return as-is
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
