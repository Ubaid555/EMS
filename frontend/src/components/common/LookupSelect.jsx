import React from 'react';
import Select from './Select';
import { useLookup } from '@/hooks/useLookup';

/**
 * LookupSelect Component
 * Connects directly to backend lookup master data using category key.
 * Automatically handles API fetching, in-memory caching, and loading indicators.
 * Supports cascading lookups via parentId.
 */
export default function LookupSelect({
  category,
  parentId = null,
  label,
  value,
  onChange,
  placeholder,
  error = null,
  required = false,
  disabled = false,
  customOptions = null,
  ...props
}) {
  const { options, loading, error: lookupError } = useLookup(category, parentId);

  const displayPlaceholder = loading
    ? 'Loading options...'
    : placeholder || `Select ${label || category}...`;

  const finalOptions = customOptions || options;
  const finalError = error || lookupError;

  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={finalOptions}
      placeholder={displayPlaceholder}
      error={finalError}
      required={required}
      disabled={disabled || loading}
      {...props}
    />
  );
}
