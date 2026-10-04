import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  AlphaInput,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  Textarea,
  Alert,
} from '@/components/common';

/**
 * Universal Reusable FormModal (Popup Form Component)
 * Can be reused across any multi-data section (Contacts, Languages, Qualifications, etc.)
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string (e.g. "Add Contact", "Edit Language")
 * - subtitle: string
 * - fields: array of field objects:
 *     [{ name, label, type: 'text'|'alpha'|'number'|'date'|'select'|'lookup'|'textarea'|'checkbox', required, options, category, placeholder, condition: (values) => boolean, helperText }]
 * - initialValues: object (for edit mode)
 * - onSubmit: (formData) => Promise<void>
 * - submitLabel: string
 * - children: optional custom form body if not using declarative fields
 */
export default function FormModal({
  isOpen = false,
  onClose,
  title = 'Form',
  subtitle = null,
  fields = [],
  initialValues = {},
  onSubmit,
  submitLabel = 'Save Record',
  children = null,
  maxWidth = 'max-w-lg',
}) {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync initial values whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialValues || {});
      setFieldErrors({});
      setGeneralError(null);
      setLoading(false);
    }
  }, [isOpen, initialValues]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Validate fields if declarative schema is provided
    if (fields && fields.length > 0) {
      const errors = {};
      fields.forEach((f) => {
        // Check condition if field is conditionally visible
        if (f.condition && !f.condition(formData)) {
          return;
        }

        const val = formData[f.name];
        if (f.required) {
          if (val === null || val === undefined || String(val).trim() === '') {
            errors[f.name] = `${f.label || f.name} is required.`;
          }
        }
      });

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      setGeneralError(err.message || 'Failed to save record. Please check inputs.');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop Overlay */}
      <div
        onClick={!loading ? onClose : undefined}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidth} bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleFormSubmit}>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {generalError && (
                <Alert
                  type="error"
                  message={generalError}
                  onClose={() => setGeneralError(null)}
                />
              )}

              {/* Declarative Fields Rendering */}
              {fields && fields.length > 0
                ? fields.map((f) => {
                    // Check conditional visibility
                    if (f.condition && !f.condition(formData)) {
                      return null;
                    }

                    const val = formData[f.name] ?? '';
                    const err = fieldErrors[f.name];

                    if (f.type === 'alpha') {
                      return (
                        <AlphaInput
                          key={f.name}
                          label={f.label}
                          value={val}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          error={err}
                          required={f.required}
                          helperText={f.helperText}
                        />
                      );
                    }

                    if (f.type === 'number') {
                      return (
                        <NumberInput
                          key={f.name}
                          label={f.label}
                          value={val}
                          currency={f.currency}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          error={err}
                          required={f.required}
                          helperText={f.helperText}
                        />
                      );
                    }

                    if (f.type === 'date') {
                      return (
                        <DateInput
                          key={f.name}
                          label={f.label}
                          value={val}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          disableFuture={f.disableFuture}
                          error={err}
                          required={f.required}
                          helperText={f.helperText}
                        />
                      );
                    }

                    if (f.type === 'select') {
                      return (
                        <Select
                          key={f.name}
                          label={f.label}
                          value={val}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          options={f.options || []}
                          placeholder={f.placeholder || `Select ${f.label}...`}
                          error={err}
                          required={f.required}
                          helperText={f.helperText}
                        />
                      );
                    }

                    if (f.type === 'lookup') {
                      return (
                        <LookupSelect
                          key={f.name}
                          category={f.category}
                          label={f.label}
                          value={val}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          error={err}
                          required={f.required}
                          helperText={f.helperText}
                        />
                      );
                    }

                    if (f.type === 'textarea') {
                      return (
                        <Textarea
                          key={f.name}
                          label={f.label}
                          value={val}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          rows={f.rows || 3}
                          error={err}
                          required={f.required}
                          helperText={f.helperText}
                        />
                      );
                    }

                    if (f.type === 'checkbox') {
                      return (
                        <label key={f.name} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={Boolean(formData[f.name])}
                            onChange={(e) => handleFieldChange(f.name, e.target.checked)}
                            className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                          />
                          <span>{f.label}</span>
                        </label>
                      );
                    }

                    // Default text input
                    return (
                      <Input
                        key={f.name}
                        label={f.label}
                        type={f.inputType || 'text'}
                        value={val}
                        onChange={(e) => handleFieldChange(f.name, e.target.value)}
                        placeholder={f.placeholder}
                        error={err}
                        required={f.required}
                        helperText={f.helperText}
                      />
                    );
                  })
                : typeof children === 'function'
                ? children({ formData, setFormData, fieldErrors, handleFieldChange })
                : children}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
