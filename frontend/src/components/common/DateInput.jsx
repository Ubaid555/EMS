import React from 'react';
import Input from './Input';
import { getTodayString, validateDate } from '@/utils/validators';

/**
 * DateInput Component (Modern Light Theme)
 */
export default function DateInput({
  value = '',
  onChange,
  disableFuture = false,
  disablePast = false,
  minDate = null,
  maxDate = null,
  minAge = null,
  maxAge = null,
  error = null,
  helperText = null,
  ...props
}) {
  const today = getTodayString();

  let computedMax = maxDate || undefined;
  if (disableFuture) {
    computedMax = today;
  }

  let computedMin = minDate || undefined;
  if (disablePast) {
    computedMin = today;
  }

  const validationError =
    error ||
    (value
      ? validateDate(value, props.label || 'Date', {
          disableFuture,
          disablePast,
          minDate,
          maxDate,
          minAge,
          maxAge,
        })
      : null);

  const defaultHelper =
    helperText ||
    (disableFuture
      ? 'Future dates are not allowed.'
      : disablePast
      ? 'Past dates are not allowed.'
      : null);

  return (
    <Input
      type="date"
      value={value}
      onChange={onChange}
      min={computedMin}
      max={computedMax}
      error={validationError}
      helperText={defaultHelper}
      inputClassName="[color-scheme:light] cursor-pointer"
      {...props}
    />
  );
}
