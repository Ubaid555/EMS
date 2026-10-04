import React from 'react';
import Input from './Input';
import { sanitizeAlpha, validateAlpha } from '@/utils/validators';

/**
 * AlphaInput Component
 * Enforces alphabetic characters only (A-Z, a-z, spaces, hyphens).
 * Strictly prevents typing digits or symbols.
 * Ideal for: Employee Name, Spouse Name, Child Name, Father/Mother Name, Job Title.
 */
export default function AlphaInput({
  value = '',
  onChange,
  allowSpaces = true,
  allowHyphens = true,
  error = null,
  showWarning = false,
  ...props
}) {
  const handleChange = (e) => {
    const rawVal = e.target.value;
    // Check if user attempted to type a number
    const sanitized = sanitizeAlpha(rawVal, { allowSpaces, allowHyphens });

    if (onChange) {
      // Pass synthetic event or sanitized string
      e.target.value = sanitized;
      onChange(e);
    }
  };

  // Compute live validation error if non-alpha entered (in case paste or browser autofill bypassed sanitization)
  const validationError = error || (props.label ? validateAlpha(value, props.label) : null);

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      error={validationError}
      helperText={
        !validationError && showWarning
          ? 'Only letters and spaces are allowed (no numbers).'
          : props.helperText
      }
      {...props}
    />
  );
}
