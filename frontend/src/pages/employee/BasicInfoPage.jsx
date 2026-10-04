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
  LookupSelect,
  Textarea,
  Alert,
  Badge,
} from '@/components/common';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function BasicInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [previousName, setPreviousName] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthDistrict, setBirthDistrict] = useState('');
  const [birthCountry, setBirthCountry] = useState('PAKISTAN');
  const [notes, setNotes] = useState('');

  // Load existing data from backend API
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await employeeService.getBasicInfo();
      if (data) {
        setFullName(data.fullName || '');
        setPreviousName(data.previousName || '');
        setGender(data.gender || '');
        setMaritalStatus(data.maritalStatus || '');
        setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '');
        if (data.placeOfBirth) {
          setBirthCity(data.placeOfBirth.city || '');
          setBirthDistrict(data.placeOfBirth.district || '');
          setBirthCountry(data.placeOfBirth.country || 'PAKISTAN');
        }
        setNotes(data.notes || '');
      }
    } catch (err) {
      // Empty state on fresh account
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
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (at least 2 characters).';
    }
    if (!gender) {
      errors.gender = 'Gender is required.';
    }
    if (!maritalStatus) {
      errors.maritalStatus = 'Marital status is required.';
    }
    if (!dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await employeeService.updateBasicInfo({
        fullName: fullName.trim(),
        previousName: previousName.trim() || undefined,
        gender,
        maritalStatus,
        dateOfBirth,
        placeOfBirth: {
          city: birthCity.trim() || undefined,
          district: birthDistrict.trim() || undefined,
          country: birthCountry.trim() || undefined,
        },
        notes: notes.trim() || undefined,
      });

      setSuccessMsg('Basic information saved and updated successfully.');
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
        <span className="text-xs font-semibold">Loading Basic Information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Employee Basic Information
            </h1>
            <Badge variant="primary">Section 01</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personal identity details, gender, marital status, and verified place of birth.
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
          <CardTitle>Biographical Form</CardTitle>
          <CardDescription>
            Existing data is pre-filled automatically. Edit any field and click Save to update your profile.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <AlphaInput
                label="Employee Full Name"
                placeholder="e.g. Muhammad Ahmad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
                required
              />

              {/* Previous Name */}
              <AlphaInput
                label="Previous / Former Name (Optional)"
                placeholder="Leave blank if name never changed"
                value={previousName}
                onChange={(e) => setPreviousName(e.target.value)}
                error={fieldErrors.previousName}
              />

              {/* Gender Lookup */}
              <LookupSelect
                category="GENDER"
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                error={fieldErrors.gender}
                required
              />

              {/* Marital Status Lookup */}
              <LookupSelect
                category="MARITAL_STATUS"
                label="Marital Status"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                error={fieldErrors.maritalStatus}
                required
              />

              {/* Date of Birth */}
              <DateInput
                label="Date of Birth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disableFuture
                error={fieldErrors.dateOfBirth}
                required
              />

              {/* Place of Birth: City */}
              <Input
                label="Place of Birth: City"
                placeholder="e.g. Lahore"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                error={fieldErrors['placeOfBirth.city']}
              />

              {/* Place of Birth: District */}
              <Input
                label="Place of Birth: District"
                placeholder="e.g. Lahore District"
                value={birthDistrict}
                onChange={(e) => setBirthDistrict(e.target.value)}
                error={fieldErrors['placeOfBirth.district']}
              />

              {/* Place of Birth: Country */}
              <Input
                label="Country of Birth"
                placeholder="e.g. Pakistan"
                value={birthCountry}
                onChange={(e) => setBirthCountry(e.target.value)}
                error={fieldErrors['placeOfBirth.country']}
              />
            </div>

            {/* Notes */}
            <Textarea
              label="Administrative Notes / Remarks"
              placeholder="Enter any additional remarks or notes..."
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
              Save Basic Info
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
