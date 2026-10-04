import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  AlphaInput,
  DateInput,
  Textarea,
  Alert,
  Badge,
} from '@/components/common';
import { formatCNIC, validateCNIC } from '@/utils/validators';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function CnicPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form Fields
  const [cnicNumber, setCnicNumber] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [issueCity, setIssueCity] = useState('');
  const [identificationMark, setIdentificationMark] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing CNIC from backend
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await employeeService.getCnic();
      if (data) {
        setCnicNumber(data.cnicNumber ? formatCNIC(data.cnicNumber) : '');
        setFatherOrHusbandName(data.fatherOrHusbandName || '');
        setDateOfIssue(data.dateOfIssue ? data.dateOfIssue.split('T')[0] : '');
        setIssueCity(data.issueCity || '');
        setIdentificationMark(data.identificationMark || '');
        setExpiryDate(data.expiryDate ? data.expiryDate.split('T')[0] : '');
        setNotes(data.notes || '');
      }
    } catch (err) {
      // Empty record on fresh account
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setFieldErrors({});

    // Client Validation
    const errors = {};
    const cnicErr = validateCNIC(cnicNumber);
    if (cnicErr) errors.cnicNumber = cnicErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await employeeService.updateCnic({
        cnicNumber: cnicNumber.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim() || undefined,
        dateOfIssue: dateOfIssue || undefined,
        issueCity: issueCity.trim() || undefined,
        identificationMark: identificationMark.trim() || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg('CNIC and National Identity records saved successfully.');
      loadData();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs font-semibold">Loading CNIC Dossier...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              CNIC & National Identification
            </h1>
            <Badge variant="primary">Section 02</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official NADRA National Identity Card details, issuance date, and physical identification marks.
          </p>
        </div>
      </div>

      {successMsg && (
        <Alert
          type="success"
          title="Saved Successfully"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {errorMsg && (
        <Alert
          type="error"
          title="Save Failed"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>NADRA Identity Card Form</CardTitle>
          <CardDescription>
            Existing data is pre-filled automatically. Edit any field and click Save to update your profile.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CNIC Number */}
              <Input
                label="CNIC Number (13-Digit Mask)"
                placeholder="35202-1234567-1"
                value={cnicNumber}
                onChange={(e) => setCnicNumber(formatCNIC(e.target.value))}
                error={fieldErrors.cnicNumber}
                required
                maxLength={15}
                helperText="Pakistan NADRA National ID format (XXXXX-XXXXXXX-X)."
              />

              {/* Father / Husband Name */}
              <AlphaInput
                label="Father / Husband Name on Card"
                placeholder="e.g. Abdul Rehman"
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
                error={fieldErrors.fatherOrHusbandName}
              />

              {/* Date of Issue */}
              <DateInput
                label="Date of Issue"
                value={dateOfIssue}
                onChange={(e) => setDateOfIssue(e.target.value)}
                disableFuture
                error={fieldErrors.dateOfIssue}
              />

              {/* Expiry Date */}
              <DateInput
                label="Card Expiry Date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                error={fieldErrors.expiryDate}
              />

              {/* Issue City */}
              <Input
                label="Issue City / Authority"
                placeholder="e.g. Lahore NADRA Mega Center"
                value={issueCity}
                onChange={(e) => setIssueCity(e.target.value)}
                error={fieldErrors.issueCity}
              />

              {/* Identification Mark */}
              <Input
                label="Visible Identification Mark"
                placeholder="e.g. Mole on right cheek or Nil"
                value={identificationMark}
                onChange={(e) => setIdentificationMark(e.target.value)}
                error={fieldErrors.identificationMark}
              />
            </div>

            {/* Notes */}
            <Textarea
              label="Audit Notes / Verification Reference"
              placeholder="NADRA tracking token, verification comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="px-6"
            >
              Save CNIC Info
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
