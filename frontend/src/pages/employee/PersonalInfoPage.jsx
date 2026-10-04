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
  RadioGroup,
  Alert,
  Badge,
} from '@/components/common';
import { formatCNIC, validateCNIC, validateRequired } from '@/utils/validators';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function PersonalInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [cnic, setCnic] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [religion, setReligion] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Fetch initial profile
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [basicRes, cnicRes] = await Promise.allSettled([
          employeeService.getBasicInfo(),
          employeeService.getCnic(),
        ]);

        if (basicRes.status === 'fulfilled' && basicRes.value) {
          const b = basicRes.value;
          setFullName(b.fullName || '');
          setFatherOrHusbandName(b.fatherOrHusbandName || '');
          setDateOfBirth(b.dateOfBirth ? b.dateOfBirth.split('T')[0] : '');
          setGender(b.gender || '');
          setMaritalStatus(b.maritalStatus || '');
          setReligion(b.religion || '');
          setBloodGroup(b.bloodGroup || '');
        }

        if (cnicRes.status === 'fulfilled' && cnicRes.value) {
          setCnic(cnicRes.value.cnicNumber || '');
        }
      } catch (err) {
        // First time users might have empty records
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setFieldErrors({});

    // Client Validation
    const errors = {};
    const nameErr = validateRequired(fullName, 'Full Name');
    if (nameErr) errors.fullName = nameErr;

    const cnicErr = validateCNIC(cnic);
    if (cnicErr) errors.cnic = cnicErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        employeeService.saveBasicInfo({
          fullName,
          fatherOrHusbandName,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          maritalStatus: maritalStatus || null,
          religion: religion || null,
          bloodGroup: bloodGroup || null,
        }),
        cnic ? employeeService.saveCnic({ cnicNumber: cnic }) : Promise.resolve(),
      ]);

      setSuccessMsg('Personal Information and Identification saved successfully.');
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
      if (parsed.fieldErrors) setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading Personal Dossier...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Personal Information & Identification
            </h1>
            <Badge variant="primary">Form 1 • Singleton</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official employee identification records with SCD Type 2 audit tracking.
          </p>
        </div>
      </div>

      {successMsg && (
        <Alert
          type="success"
          title="Record Updated"
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
          <CardTitle>Basic Biographical Details</CardTitle>
          <CardDescription>
            All details must match official government CNIC and academic credentials.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <AlphaInput
                label="Employee Full Name (Letters Only)"
                placeholder="e.g. Muhammad Ahmad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
                required
              />

              {/* Father/Husband Name */}
              <AlphaInput
                label="Father / Husband Name"
                placeholder="e.g. Abdul Rehman"
                value={fatherOrHusbandName}
                onChange={(e) => setFatherOrHusbandName(e.target.value)}
                error={fieldErrors.fatherOrHusbandName}
              />

              {/* CNIC Number */}
              <Input
                label="CNIC Number (13-Digit Mask)"
                placeholder="35202-1234567-1"
                value={cnic}
                onChange={(e) => setCnic(formatCNIC(e.target.value))}
                error={fieldErrors.cnic}
                required
                maxLength={15}
                helperText="Standard Pakistani National ID mask (XXXXX-XXXXXXX-X)."
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

              {/* Gender Lookup */}
              <LookupSelect
                category="GENDER"
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                error={fieldErrors.gender}
              />

              {/* Marital Status Lookup */}
              <LookupSelect
                category="MARITAL_STATUS"
                label="Marital Status"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                error={fieldErrors.maritalStatus}
              />

              {/* Religion Lookup */}
              <LookupSelect
                category="RELIGION"
                label="Religion"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                error={fieldErrors.religion}
              />

              {/* Blood Group Lookup */}
              <LookupSelect
                category="BLOOD_GROUP"
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                error={fieldErrors.bloodGroup}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="px-6"
            >
              Save Personal Info
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
