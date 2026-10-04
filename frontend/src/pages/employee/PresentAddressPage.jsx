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

export default function PresentAddressPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form Fields
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [street, setStreet] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [landlineNumber, setLandlineNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing Present Address from backend
  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await employeeService.getPresentAddress();
      if (data) {
        setSameAsPermanent(Boolean(data.sameAsPermanent));
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
      await employeeService.updatePresentAddress({
        sameAsPermanent,
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

      setSuccessMsg('Present residence address saved successfully.');
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
        <span className="text-xs font-semibold">Loading Present Address...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Present / Current Residential Address
            </h1>
            <Badge variant="primary">Section 03</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current living location used for official correspondence, mailing, and regional postings.
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Current Living Address Form</CardTitle>
              <CardDescription>
                Existing data is pre-filled automatically. If same as permanent, toggle the checkbox below.
              </CardDescription>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sameAsPermanent}
                onChange={(e) => setSameAsPermanent(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span>Same as Permanent Address</span>
            </label>
          </div>
        </CardHeader>

        <form onSubmit={handleSave}>
          <CardContent className="space-y-5">
            {!sameAsPermanent ? (
              <>
                <Textarea
                  label="House No. / Flat / Building Address Line"
                  placeholder="e.g. House # 14-B, Street 5, Gulberg III"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  rows={2}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <Input
                    label="Street / Road"
                    placeholder="e.g. Main Boulevard"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />

                  <Input
                    label="Post Office / Postal Code"
                    placeholder="e.g. GPO 54000"
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                  />

                  <Input
                    label="City / Town"
                    placeholder="e.g. Lahore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />

                  <Input
                    label="District"
                    placeholder="e.g. Lahore District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />

                  <Input
                    label="Residence Landline / Phone"
                    placeholder="042-35712345"
                    value={landlineNumber}
                    onChange={(e) => setLandlineNumber(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="p-6 rounded-xl bg-sky-50/60 border border-sky-200 text-sky-900 text-xs">
                <p className="font-semibold">Notice: Same as Permanent Address Selected</p>
                <p className="mt-1 text-sky-700">
                  Your present address is automatically linked to your verified Permanent Address. No separate address entry is required.
                </p>
              </div>
            )}

            <Textarea
              label="Location Landmark / Directions / Notes"
              placeholder="Near landmark, police station jurisdiction..."
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
              Save Present Address
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
