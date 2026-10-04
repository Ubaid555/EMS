/**
 * Comprehensive Enterprise Validation & Formatting Utilities
 * Handles validation rules, date restrictions, sanitizers, and form validation pipelines.
 */

// REGEX PATTERNS
export const REGEX = {
  // Only alphabetic characters (A-Z, a-z), spaces, hyphens, and apostrophes
  ALPHA_ONLY: /^[a-zA-Z\s\-']+$/,
  // Pure digits only
  DIGITS_ONLY: /^\d+$/,
  // Numbers with optional decimal
  NUMERIC_DECIMAL: /^-?\d+(\.\d+)?$/,
  // Pakistan CNIC standard (e.g. 35202-1234567-1)
  CNIC: /^\d{5}-\d{7}-\d{1}$/,
  // Standard RFC Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Phone numbers (e.g. +92 300 1234567 or 03001234567)
  PHONE: /^(\+92|0)?3\d{2}[-\s]?\d{7}$/,
};

/**
 * ========================================================
 * SANITIZERS (Run on input change to prevent bad characters)
 * ========================================================
 */

/**
 * Strips all digits, symbols, and special characters, allowing only letters and spaces.
 * Ideal for Person Names, Spouse/Child Names, Job Titles.
 */
export function sanitizeAlpha(val, { allowSpaces = true, allowHyphens = true } = {}) {
  if (typeof val !== 'string') return '';
  let pattern = '[^a-zA-Z';
  if (allowSpaces) pattern += '\\s';
  if (allowHyphens) pattern += "\\-'";
  pattern += ']';
  return val.replace(new RegExp(pattern, 'g'), '');
}

/**
 * Strips all non-digit and non-decimal characters.
 * Ideal for Amounts, Salaries, Valuations, Counts.
 */
export function sanitizeNumeric(val, { allowDecimal = true, allowNegative = false } = {}) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (!allowNegative) {
    str = str.replace(/-/g, '');
  }
  if (!allowDecimal) {
    return str.replace(/\D/g, '');
  }
  // Allow only digits and first decimal point
  const parts = str.replace(/[^\d.]/g, '').split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return parts.join('.');
}

/**
 * Formats a raw 13-digit number into standard CNIC mask: XXXXX-XXXXXXX-X
 */
export function formatCNIC(val) {
  const digits = String(val || '').replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Formats a number to currency format (e.g. 1,500,000)
 */
export function formatCurrency(amount, currency = 'PKR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  const num = Number(amount);
  return `${currency} ${num.toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
}

/**
 * Formats Date to YYYY-MM-DD for native HTML5 date input values
 */
export function formatDateForInput(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Returns today's date in YYYY-MM-DD string format (useful for max/min attributes)
 */
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * ========================================================
 * FIELD-LEVEL VALIDATORS (Returns null if valid, error string if invalid)
 * ========================================================
 */

export function validateRequired(val, fieldName = 'This field') {
  if (val === null || val === undefined || String(val).trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
}

export function validateAlpha(val, fieldName = 'This field', { allowSpaces = true } = {}) {
  if (!val) return null; // Let validateRequired handle empty check if needed
  const str = String(val).trim();
  if (!REGEX.ALPHA_ONLY.test(str)) {
    return `${fieldName} must only contain alphabetic characters (no numbers or symbols).`;
  }
  return null;
}

export function validateNumeric(
  val,
  fieldName = 'Amount',
  { min, max, allowDecimal = true, allowNegative = false } = {}
) {
  if (val === null || val === undefined || String(val).trim() === '') return null;
  const num = Number(val);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number (no letters allowed).`;
  }
  if (!allowNegative && num < 0) {
    return `${fieldName} cannot be negative.`;
  }
  if (!allowDecimal && !Number.isInteger(num)) {
    return `${fieldName} must be a whole integer.`;
  }
  if (min !== undefined && num < min) {
    return `${fieldName} cannot be less than ${min}.`;
  }
  if (max !== undefined && num > max) {
    return `${fieldName} cannot exceed ${max}.`;
  }
  return null;
}

export function validateCNIC(val, fieldName = 'CNIC') {
  if (!val) return null;
  if (!REGEX.CNIC.test(String(val).trim())) {
    return `${fieldName} must be 13 digits in standard format (e.g., 35202-1234567-1).`;
  }
  return null;
}

export function validateEmail(val, fieldName = 'Email') {
  if (!val) return null;
  if (!REGEX.EMAIL.test(String(val).trim())) {
    return `${fieldName} must be a valid email address.`;
  }
  return null;
}

export function validatePhone(val, fieldName = 'Phone') {
  if (!val) return null;
  if (!REGEX.PHONE.test(String(val).trim())) {
    return `${fieldName} must be a valid Pakistani phone number (e.g. 03001234567).`;
  }
  return null;
}

/**
 * Comprehensive Date Validator with future/past/range and age restrictions
 */
export function validateDate(
  val,
  fieldName = 'Date',
  {
    disableFuture = false,
    disablePast = false,
    minDate = null,
    maxDate = null,
    minAge = null,
    maxAge = null,
  } = {}
) {
  if (!val) return null;

  const targetDate = new Date(val);
  if (isNaN(targetDate.getTime())) {
    return `${fieldName} must be a valid calendar date.`;
  }

  // Normalize today at start of day (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(targetDate);
  selectedDate.setHours(0, 0, 0, 0);

  if (disableFuture && selectedDate > today) {
    return `${fieldName} cannot be in the future.`;
  }

  if (disablePast && selectedDate < today) {
    return `${fieldName} cannot be in the past.`;
  }

  if (minDate) {
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    if (selectedDate < min) {
      return `${fieldName} cannot be earlier than ${min.toLocaleDateString()}.`;
    }
  }

  if (maxDate) {
    const max = new Date(maxDate);
    max.setHours(0, 0, 0, 0);
    if (selectedDate > max) {
      return `${fieldName} cannot be later than ${max.toLocaleDateString()}.`;
    }
  }

  // Age Calculations (e.g. Date of Birth)
  if (minAge !== null || maxAge !== null) {
    let age = today.getFullYear() - selectedDate.getFullYear();
    const m = today.getMonth() - selectedDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
      age--;
    }

    if (minAge !== null && age < minAge) {
      return `Must be at least ${minAge} years old (current age: ${age}).`;
    }
    if (maxAge !== null && age > maxAge) {
      return `Cannot exceed ${maxAge} years of age (current age: ${age}).`;
    }
  }

  return null;
}

/**
 * ========================================================
 * FORM VALIDATOR ENGINE
 * Takes a data object and a schema definition, returns { isValid, errors }
 * ========================================================
 */
export function validateForm(formData, schema) {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    const ruleList = Array.isArray(rules) ? rules : [rules];

    for (const rule of ruleList) {
      if (typeof rule === 'function') {
        const errorMsg = rule(value);
        if (errorMsg) {
          errors[field] = errorMsg;
          isValid = false;
          break; // Stop at first failing rule for this field
        }
      }
    }
  }

  return { isValid, errors };
}
