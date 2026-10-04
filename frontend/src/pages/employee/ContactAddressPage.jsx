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
  LookupSelect,
  Alert,
  Badge,
} from '@/components/common';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function ContactAddressPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Present Address
  const [presentStreet, setPresentStreet] = useState('');
  const [presentCity, setPresentCity] = useState('');
  const [presentDistrict, setPresentDistrict] = useState('');

  // Permanent Address
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [permanentStreet, setPermanentStreet] = useState('');
  const [permanentCity, setPermanentCity] = useState('');
  const [permanentDistrict, setPermanentDistrict] = useState('');

  // Contacts
  const [mobileNumber, setMobileNumber] = useState('');
  const [landlineNumber, setLandlineNumber] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [addrRes, contactRes] = await Promise.allSettled([
          employeeService.getAddresses(),
          employeeService.getContacts(),
        ]);

        if (addrRes.status === 'fulfilled' && Array.isArray(addrRes.value)) {
          const present = addrRes.value.find((a) => a.addressType === 'PRESENT');
          if (present) {
            setPresentStreet(present.addressLine || '');
            setPresentCity(present.city || '');
            setPresentDistrict(present.district || '');
          }

          const permanent = addrRes.value.find((a) => a.addressType === 'PERMANENT');
          if (permanent) {
            setPermanentStreet(permanent.addressLine || '');
            setPermanentCity(permanent.city || '');
            setPermanentDistrict(permanent.district || '');
          }
        }

        if (contactRes.status === 'fulfilled' && Array.isArray(contactRes.value)) {
          const mob = contactRes.value.find((c) => c.contactType === 'MOBILE');
          if (mob) setMobileNumber(mob.contactValue || '');

          const land = contactRes.value.find((c) => c.contactType === 'LANDLINE');
          if (land) setLandlineNumber(land.contactValue || '');
        }
      } catch (err) {
        // empty initial
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSameAsPresentToggle = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);
    if (checked) {
      setPermanentStreet(presentStreet);
      setPermanentCity(presentCity);
      setPermanentDistrict(presentDistrict);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setSaving(true);

    try {
      // Save addresses
      const permStreetToSave = sameAsPresent ? presentStreet : permanentStreet;
      const permCityToSave = sameAsPresent ? presentCity : permanentCity;
      const permDistrictToSave = sameAsPresent ? presentDistrict : permanentDistrict;

      await Promise.all([
        presentStreet &&
          employeeService.addAddress({
            addressType: 'PRESENT',
            addressLine: presentStreet,
            city: presentCity,
            district: presentDistrict,
          }),
        permStreetToSave &&
          employeeService.addAddress({
            addressType: 'PERMANENT',
            addressLine: permStreetToSave,
            city: permCityToSave,
            district: permDistrictToSave,
          }),
        mobileNumber &&
          employeeService.addContact({
            contactType: 'MOBILE',
            contactValue: mobileNumber,
          }),
        landlineNumber &&
          employeeService.addContact({
            contactType: 'LANDLINE',
            contactValue: landlineNumber,
          }),
      ]);

      setSuccessMsg('Addresses and contact details updated successfully.');
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading Address Dossier...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Contact & Residential Addresses
            </h1>
            <Badge variant="primary">Form 2 • Dual Address</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Communication channels, official domicile, and permanent family residences.
          </p>
        </div>
      </div>

      {successMsg && (
        <Alert
          type="success"
          title="Updated Successfully"
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Phone Numbers</CardTitle>
            <CardDescription>Primary mobile and residential landlines.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Primary Mobile Number"
              placeholder="0300-1234567"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              helperText="For SMS notices and OTP verification."
            />
            <Input
              label="Landline / Residence Phone"
              placeholder="042-35123456"
              value={landlineNumber}
              onChange={(e) => setLandlineNumber(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Present Address */}
        <Card>
          <CardHeader>
            <CardTitle>Present / Current Mailing Address</CardTitle>
            <CardDescription>Where you currently reside for official correspondence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Street Address / House No."
              placeholder="House #, Street #, Sector/Block..."
              value={presentStreet}
              onChange={(e) => setPresentStreet(e.target.value)}
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="City / Town"
                placeholder="e.g. Lahore"
                value={presentCity}
                onChange={(e) => setPresentCity(e.target.value)}
              />
              <Input
                label="District"
                placeholder="e.g. Lahore District"
                value={presentDistrict}
                onChange={(e) => setPresentDistrict(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permanent Address */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Permanent / Domicile Address</CardTitle>
                <CardDescription>Official permanent record as stated on CNIC.</CardDescription>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAsPresent}
                  onChange={handleSameAsPresentToggle}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Same as Present Address</span>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Street Address"
              placeholder="House #, Village / Town..."
              value={sameAsPresent ? presentStreet : permanentStreet}
              onChange={(e) => setPermanentStreet(e.target.value)}
              disabled={sameAsPresent}
              rows={2}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="City / Town"
                placeholder="e.g. Rawalpindi"
                value={sameAsPresent ? presentCity : permanentCity}
                onChange={(e) => setPermanentCity(e.target.value)}
                disabled={sameAsPresent}
              />
              <Input
                label="District"
                placeholder="e.g. Rawalpindi District"
                value={sameAsPresent ? presentDistrict : permanentDistrict}
                onChange={(e) => setPermanentDistrict(e.target.value)}
                disabled={sameAsPresent}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="primary" loading={saving} className="px-6">
              Save Addresses & Contacts
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
