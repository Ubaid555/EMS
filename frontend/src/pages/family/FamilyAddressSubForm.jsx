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

/**
 * Universal Family Member Address Sub-Form
 * Used for both Present & Permanent Address across Spouses, Children, and Parents
 */
export default function FamilyAddressSubForm({
  memberId,
  memberName,
  type = 'present', // 'present' | 'permanent'
}) {
  const isPresent = type === 'present';
  const storageKey = `family_addr_${memberId}_${type}`;
  const permStorageKey = `family_addr_${memberId}_permanent`;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [street, setStreet] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [landline, setLandline] = useState('');
  const [notes, setNotes] = useState('');

  // Reload data whenever memberId or type changes
  useEffect(() => {
    if (!memberId) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        setSameAsPermanent(Boolean(data.sameAsPermanent));
        setAddressLine(data.addressLine || '');
        setStreet(data.street || '');
        setPostOffice(data.postOffice || '');
        setCity(data.city || '');
        setDistrict(data.district || '');
        setLandline(data.landline || '');
        setNotes(data.notes || '');
      } else {
        // Reset to empty
        setSameAsPermanent(false);
        setAddressLine('');
        setStreet('');
        setPostOffice('');
        setCity('');
        setDistrict('');
        setLandline('');
        setNotes('');
      }
    } catch {
      // ignore
    }
  }, [memberId, storageKey]);

  // Handle same as permanent toggle
  const handleToggleSameAsPermanent = (checked) => {
    setSameAsPermanent(checked);
    if (checked) {
      try {
        const permRaw = localStorage.getItem(permStorageKey);
        if (permRaw) {
          const permData = JSON.parse(permRaw);
          setAddressLine(permData.addressLine || '');
          setStreet(permData.street || '');
          setPostOffice(permData.postOffice || '');
          setCity(permData.city || '');
          setDistrict(permData.district || '');
          setLandline(permData.landline || '');
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!addressLine.trim()) {
      setErrorMsg('Address line / House details are required.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('City is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sameAsPermanent: isPresent ? sameAsPermanent : false,
        addressLine: addressLine.trim(),
        street: street.trim(),
        postOffice: postOffice.trim(),
        city: city.trim(),
        district: district.trim(),
        landline: landline.trim(),
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
      setSuccessMsg(
        `${isPresent ? 'Present' : 'Permanent'} address for ${memberName} saved successfully.`
      );
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg">
                {isPresent ? 'Present Residence Address' : 'Permanent Domicile Address'}
              </CardTitle>
              <Badge variant={isPresent ? 'primary' : 'neutral'} size="sm">
                {memberName}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              {isPresent
                ? 'Current temporary or official residential accommodation for this family member.'
                : 'Registered ancestral or legal permanent domicile address.'}
            </CardDescription>
          </div>

          {isPresent && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={sameAsPermanent}
                onChange={(e) => handleToggleSameAsPermanent(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span>Same as Permanent Address</span>
            </label>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-4 pt-6">
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
              title="Validation Error"
              message={errorMsg}
              onClose={() => setErrorMsg(null)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Address Line / House / Flat / Street (Required)"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. House # 12-A, Street 4, Sector G-10/2"
                required
                disabled={isPresent && sameAsPermanent}
              />
            </div>

            <Input
              label="Mohallah / Sector / Area"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Officers Colony or Johar Town"
              disabled={isPresent && sameAsPermanent}
            />

            <Input
              label="Post Office / Postal Code"
              value={postOffice}
              onChange={(e) => setPostOffice(e.target.value)}
              placeholder="e.g. GPO Islamabad 44000"
              disabled={isPresent && sameAsPermanent}
            />

            <Input
              label="City (Required)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lahore or Islamabad"
              required
              disabled={isPresent && sameAsPermanent}
            />

            <Input
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Rawalpindi, Lahore"
              disabled={isPresent && sameAsPermanent}
            />

            <Input
              label="Landline / Resident Phone Number"
              value={landline}
              onChange={(e) => setLandline(e.target.value)}
              placeholder="e.g. 051-9261234"
              disabled={isPresent && sameAsPermanent}
            />

            <div className="md:col-span-2">
              <Textarea
                label="Audit Remarks / Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Verification references or special living arrangement remarks..."
                rows={2}
                disabled={isPresent && sameAsPermanent}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isPresent ? 'Present Residence Sub-Form' : 'Permanent Domicile Sub-Form'}
          </span>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={isPresent && sameAsPermanent}
          >
            Save {isPresent ? 'Present' : 'Permanent'} Address
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
