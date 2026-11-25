/**
 * Centralized Form Validation Utilities for MessBee Mobile App
 */

export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
};

export const isValidEmail = (email) => {
  if (!isRequired(email)) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
};

export const isValidPhone = (phone) => {
  if (!isRequired(phone)) return false;
  // Strip spaces, dashes, parentheses, plus
  const cleaned = String(phone).replace(/[\s\-()]/g, '');
  return /^\+?[0-9]{10,15}$/.test(cleaned);
};

export const isValidUrl = (url) => {
  if (!isRequired(url)) return false;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(String(url).trim());
  }
};

export const isValidNumber = (val, { min = -Infinity, max = Infinity } = {}) => {
  if (!isRequired(val)) return false;
  const num = Number(val);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

export const isValidPassword = (password, minLength = 6) => {
  if (!password) return false;
  return String(password).length >= minLength;
};

export const isValidPin = (pin, length = 6) => {
  if (!pin) return false;
  const regex = new RegExp(`^[0-9]{${length}}$`);
  return regex.test(String(pin).trim());
};

export const isValidShortcut = (shortcut) => {
  if (!isRequired(shortcut)) return false;
  return /^\/?[a-zA-Z0-9_-]{2,30}$/.test(String(shortcut).trim());
};

/**
 * Validate a map of field rules.
 * Each rule entry: { value, required?, email?, phone?, url?, number?, min?, max?, minLength?, match?, label }
 * Returns { isValid: boolean, errors: Record<string, string>, firstError: string | null }
 */
export const validateForm = (rules) => {
  const errors = {};
  let firstError = null;

  for (const [field, rule] of Object.entries(rules)) {
    const label = rule.label || field;
    const val = rule.value;
    let err = null;

    if (rule.required && !isRequired(val)) {
      err = rule.requiredMessage || `${label} is required.`;
    } else if (isRequired(val)) {
      if (rule.email && !isValidEmail(val)) {
        err = `Please enter a valid ${label.toLowerCase()}.`;
      } else if (rule.phone && !isValidPhone(val)) {
        err = `Please enter a valid 10-15 digit ${label.toLowerCase()}.`;
      } else if (rule.url && !isValidUrl(val)) {
        err = `${label} must start with http:// or https://.`;
      } else if (rule.number && !isValidNumber(val, { min: rule.min ?? -Infinity, max: rule.max ?? Infinity })) {
        if (rule.min !== undefined && Number(val) < rule.min) {
          err = `${label} must be at least ${rule.min}.`;
        } else if (rule.max !== undefined && Number(val) > rule.max) {
          err = `${label} cannot exceed ${rule.max}.`;
        } else {
          err = `${label} must be a valid number.`;
        }
      } else if (rule.minLength && String(val).trim().length < rule.minLength) {
        err = `${label} must be at least ${rule.minLength} characters.`;
      } else if (rule.pin && !isValidPin(val, rule.pinLength || 6)) {
        err = `${label} must be exactly ${rule.pinLength || 6} digits.`;
      } else if (rule.shortcut && !isValidShortcut(val)) {
        err = `${label} cannot contain spaces or special characters.`;
      } else if (rule.match !== undefined && val !== rule.match) {
        err = rule.matchMessage || `${label} does not match.`;
      } else if (rule.custom) {
        err = rule.custom(val);
      }
    }

    if (err) {
      errors[field] = err;
      if (!firstError) firstError = err;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};
