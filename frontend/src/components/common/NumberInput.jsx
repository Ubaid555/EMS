import React from 'react';
import Input from './Input';
import { sanitizeNumeric, validateNumeric } from '@/utils/validators';

/**
 * NumberInput Component
 * Enforces numeric characters only. Prevents typing letters or invalid symbols.
 * Supports currency prefix, min/max limits, whole integer or decimals.
 * Ideal for: Finance Income Amount, Expense Amount, Asset Valuation, Assigned Number.
 */
export default function NumberInput({
  value = '',
  onChange,
  allowDecimal = true,
  allowNegative = false,
  min = undefined,
  max = undefined,
  currency = null, // e.g. 'PKR', '$'
  error = null,
  ...props
}) {
  const handleChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = sanitizeNumeric(rawVal, { allowDecimal, allowNegative });

    if (onChange) {
      e.target.value = sanitized;
      onChange(e);
    }
  };

  const validationError =
    error || (props.label ? validateNumeric(value, props.label, { min, max, allowDecimal, allowNegative }) : null);

  return (
    <Input
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={value}
      onChange={handleChange}
      error={validationError}
      leftIcon={
        currency ? (
          <span className="text-xs font-bold text-slate-400 select-none">
            {currency}
          </span>
        ) : (
          props.leftIcon
        )
      }
      {...props}
    />
  );
}
