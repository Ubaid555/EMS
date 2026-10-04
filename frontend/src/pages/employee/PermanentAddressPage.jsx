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
  Textarea,
  Alert,
  Badge,
} from '@/components/common';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function PermanentAddressPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form Fields
  const [addressLine, setAddressLine] = useState('');
  const [street, setStreet] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [landlineNumber, setLandlineNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing Permanent Address from backend
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await employeeService.getPermanentAddress();
      if (data) {
        setAddressLine(data.addressLine || '');
        setStreet(data.street || '');
        setPostOffice(data.postOffice || '');
        if (data.place) {
          setCity(data.place.city || '');
          setDistrict(data.place.district || '');
        }
        if (Array.isArray(data.landlineNumbers) && data.landlineNumbers.length > 0) {
          setLandlineNumber(data.landlineNumbers[0]);
        }
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
    setSaving(true);

    try {
      await employeeService.updatePermanentAddress({
        addressLine: addressLine.trim() || undefined,
        street: street.trim() || undefined,
        postOffice: postOffice.trim() || undefined,
        landlineNumbers: landlineNumber.trim() ? [landlineNumber.trim()] : [],
        place: {
          city: city.trim() || undefined,
          district: district.trim() || undefined,
        },
        notes: notes.trim() || undefined,
      });

      setSuccessMsg('Permanent domicile address saved successfully.');
      loadData();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs font-semibold">Loading Permanent Address...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Permanent / Domicile Address
            </h1>
            <Badge variant="primary">Section 04</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official legal domicile recorded on your CNIC for pension, gratuity, and background verification.
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
          <CardTitle>Permanent Domicile Form</CardTitle>
          <CardDescription>
            Existing data is pre-filled automatically. Edit any field and click Save to update your profile.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-5">
            <Textarea
              label="Village / Street / House No. Permanent Address Line"
              placeholder="e.g. Village Chak 42-RB, Tehsil & District Faisalabad"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              rows={2}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <Input
                label="Street / Ward"
                placeholder="e.g. Ward 4, Mohallah Qasim"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />

              <Input
                label="Post Office / GPO"
                placeholder="e.g. Head Post Office 38000"
                value={postOffice}
                onChange={(e) => setPostOffice(e.target.value)}
              />

              <Input
                label="City / Native Town"
                placeholder="e.g. Faisalabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <Input
                label="District"
                placeholder="e.g. Faisalabad District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />

              <Input
                label="Permanent Landline / Contact"
                placeholder="041-8765432"
                value={landlineNumber}
                onChange={(e) => setLandlineNumber(e.target.value)}
              />
            </div>

            <Textarea
              label="Domicile Remarks / Police Station Jurisdiction"
              placeholder="Police Station jurisdiction, verified landmark..."
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
              Save Permanent Address
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
