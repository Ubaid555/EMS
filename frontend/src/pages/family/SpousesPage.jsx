import React, { useState, useEffect, useMemo } from 'react';
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
  Select,
  Textarea,
  Badge,
  Alert,
  DataTable,
  FormModal,
} from '@/components/common';
import familyService from '@/services/family.service';
import { parseApiError } from '@/utils/api-error';
import FamilyAddressSubForm from './FamilyAddressSubForm';
import FamilyCnicSubForm from './FamilyCnicSubForm';

export default function SpousesPage() {
  const [spouses, setSpouses] = useState([]);
  const [selectedSpouseId, setSelectedSpouseId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'present_address' | 'permanent_address' | 'cnic' | 'education'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Add/Edit Spouse Core Modal
  const [coreModalOpen, setCoreModalOpen] = useState(false);
  const [editingSpouse, setEditingSpouse] = useState(null);

  // Education state for selected spouse
  const [educations, setEducations] = useState([]);
  const [eduLoading, setEduLoading] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);

  // Basic Profile Form fields for active spouse
  const [profileName, setProfileName] = useState('');
  const [profileStatus, setProfileStatus] = useState('MARRIED');
  const [profileMarriageDate, setProfileMarriageDate] = useState('');
  const [profileNationality, setProfileNationality] = useState('PAKISTANI');
  const [profileIsDependent, setProfileIsDependent] = useState(true);
  const [profileIsAlive, setProfileIsAlive] = useState(true);
  const [profileDeathDate, setProfileDeathDate] = useState('');
  const [profileNotes, setProfileNotes] = useState('');

  // Fetch all spouses for this employee
  const fetchSpouses = async (targetSelectId = null) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await familyService.getSpouses();
      const list = Array.isArray(data) ? data : [];
      setSpouses(list);

      if (list.length > 0) {
        if (targetSelectId && list.some((s) => s._id === targetSelectId)) {
          setSelectedSpouseId(targetSelectId);
        } else if (!selectedSpouseId || !list.some((s) => s._id === selectedSpouseId)) {
          setSelectedSpouseId(list[0]._id);
        }
      } else {
        setSelectedSpouseId(null);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpouses();
  }, []);

  // Currently selected spouse document
  const activeSpouse = useMemo(() => {
    return spouses.find((s) => s._id === selectedSpouseId) || null;
  }, [spouses, selectedSpouseId]);

  // Sync basic profile form fields whenever active spouse changes
  useEffect(() => {
    if (activeSpouse) {
      setProfileName(activeSpouse.name || '');
      setProfileStatus(activeSpouse.status || 'MARRIED');
      setProfileMarriageDate(
        activeSpouse.marriageDate ? activeSpouse.marriageDate.split('T')[0] : ''
      );
      setProfileNationality(activeSpouse.nationality || 'PAKISTANI');
      setProfileIsDependent(activeSpouse.isDependent ?? true);
      setProfileIsAlive(activeSpouse.isAlive ?? true);
      setProfileDeathDate(
        activeSpouse.deathDate ? activeSpouse.deathDate.split('T')[0] : ''
      );
      setProfileNotes(activeSpouse.notes || '');
    }
  }, [activeSpouse]);

  // Load spouse educations when education sub-tab is active
  useEffect(() => {
    if (activeSubTab === 'education' && selectedSpouseId) {
      setEduLoading(true);
      familyService
        .getSpouseEducations(selectedSpouseId)
        .then((res) => setEducations(Array.isArray(res) ? res : []))
        .catch(() => setEducations([]))
        .finally(() => setEduLoading(false));
    }
  }, [activeSubTab, selectedSpouseId]);

  // Handle Save Core Basic Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!activeSpouse?._id) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!profileName.trim()) {
      setErrorMsg('Spouse full name is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profileName.trim(),
        status: profileStatus,
        marriageDate: profileMarriageDate || undefined,
        nationality: profileNationality.trim() || 'PAKISTANI',
        isDependent: Boolean(profileIsDependent),
        isAlive: Boolean(profileIsAlive),
        deathDate: !profileIsAlive && profileDeathDate ? profileDeathDate : undefined,
        notes: profileNotes.trim() || undefined,
      };

      await familyService.updateSpouse(activeSpouse._id, payload);
      setSuccessMsg(`Profile for ${payload.name} updated successfully.`);
      fetchSpouses(activeSpouse._id);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message || 'Failed to update spouse profile.');
    } finally {
      setSaving(false);
    }
  };

  // Open modal to add a brand new spouse
  const handleOpenAddModal = () => {
    setEditingSpouse(null);
    setCoreModalOpen(true);
  };

  // Open modal to edit existing spouse core name/status
  const handleOpenEditModal = () => {
    if (!activeSpouse) return;
    setEditingSpouse(activeSpouse);
    setCoreModalOpen(true);
  };

  const handleDeleteSpouse = async () => {
    if (!activeSpouse) return;
    if (
      !window.confirm(
        `Are you sure you want to completely remove spouse "${activeSpouse.name}" from employee records?`
      )
    ) {
      return;
    }

    try {
      await familyService.deleteSpouse(activeSpouse._id);
      setSuccessMsg(`Spouse "${activeSpouse.name}" removed successfully.`);
      fetchSpouses();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message || 'Failed to remove spouse.');
    }
  };

  // Declarative fields for Add/Edit Spouse Popup Modal
  const spouseModalFields = [
    {
      name: 'name',
      label: 'Spouse Full Name',
      type: 'alpha',
      placeholder: 'e.g. Fatima Bibi',
      required: true,
      helperText: 'Legal name as recorded on official marriage registration certificate.',
    },
    {
      name: 'status',
      label: 'Marital Relationship Status',
      type: 'select',
      required: true,
      options: [
        { value: 'MARRIED', label: 'Married (Current)' },
        { value: 'DIVORCED', label: 'Divorced' },
        { value: 'WIDOWED', label: 'Widowed' },
        { value: 'SEPARATED', label: 'Separated' },
      ],
    },
    {
      name: 'marriageDate',
      label: 'Date of Marriage (Nikah)',
      type: 'date',
      disableFuture: true,
    },
    {
      name: 'nationality',
      label: 'Nationality',
      type: 'text',
      placeholder: 'PAKISTANI',
      helperText: 'Default: PAKISTANI',
    },
    {
      name: 'isDependent',
      label: 'Financial Dependent on Employee',
      type: 'checkbox',
    },
    {
      name: 'isAlive',
      label: 'Is Alive',
      type: 'checkbox',
    },
    {
      name: 'notes',
      label: 'Audit Notes / Nikahnama Ref',
      type: 'textarea',
      placeholder: 'Nikahnama registration number, union council details...',
      rows: 2,
    },
  ];

  const initialModalValues = editingSpouse
    ? {
        name: editingSpouse.name || '',
        status: editingSpouse.status || 'MARRIED',
        marriageDate: editingSpouse.marriageDate ? editingSpouse.marriageDate.split('T')[0] : '',
        nationality: editingSpouse.nationality || 'PAKISTANI',
        isDependent: editingSpouse.isDependent ?? true,
        isAlive: editingSpouse.isAlive ?? true,
        notes: editingSpouse.notes || '',
      }
    : {
        name: '',
        status: 'MARRIED',
        marriageDate: '',
        nationality: 'PAKISTANI',
        isDependent: true,
        isAlive: true,
        notes: '',
      };

  const handleModalSubmit = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      status: formData.status || 'MARRIED',
      marriageDate: formData.marriageDate || undefined,
      nationality: formData.nationality ? formData.nationality.trim().toUpperCase() : 'PAKISTANI',
      isDependent: Boolean(formData.isDependent),
      isAlive: Boolean(formData.isAlive),
      notes: formData.notes ? formData.notes.trim() : undefined,
    };

    if (editingSpouse?._id) {
      await familyService.updateSpouse(editingSpouse._id, payload);
      setSuccessMsg(`Spouse "${payload.name}" updated successfully.`);
      fetchSpouses(editingSpouse._id);
    } else {
      const created = await familyService.addSpouse(payload);
      setSuccessMsg(`New spouse "${payload.name}" registered successfully.`);
      fetchSpouses(created?._id);
    }
  };

  // Education Columns & Modal Handler
  const eduColumns = [
    { key: 'degree', label: 'Degree / Certificate', sortable: true },
    { key: 'institute', label: 'Board / University', sortable: true },
    { key: 'passingYear', label: 'Passing Year' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm('Delete this education record?')) return;
            await familyService.deleteSpouseEducation(selectedSpouseId, row._id);
            const res = await familyService.getSpouseEducations(selectedSpouseId);
            setEducations(Array.isArray(res) ? res : []);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
          title="Delete education record"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      ),
    },
  ];

  const handleAddEducationSubmit = async (formData) => {
    if (!selectedSpouseId) return;
    await familyService.addSpouseEducation(selectedSpouseId, {
      degree: formData.degree,
      institute: formData.institute,
      passingYear: formData.passingYear || undefined,
    });
    const res = await familyService.getSpouseEducations(selectedSpouseId);
    setEducations(Array.isArray(res) ? res : []);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. MASTER SPOUSE SELECTOR (Handles 1, 2, or more spouses)                  */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Family Dossier
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Spouses Registry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Spouse Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an existing spouse below or register an additional spouse to update their individual dossier.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add New Spouse
          </Button>
        </div>

        {/* Member List / Selector Chips */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading registered spouses...</div>
        ) : spouses.length === 0 ? (
          <div className="py-10 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 mt-4 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">No Spouse Records Registered</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Begin by registering the employee's spouse to maintain their profile, addresses, and educational history.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
              + Register First Spouse
            </Button>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Spouse Records ({spouses.length}):
            </span>
            {spouses.map((s, index) => {
              const isSelected = s._id === selectedSpouseId;
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSelectedSpouseId(s._id)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all select-none shrink-0 cursor-pointer
                    ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-600/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }
                  `}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {index + 1}
                  </span>
                  <span>{s.name}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {s.status || 'MARRIED'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <Alert
          type="success"
          title="Operation Succeeded"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
      {errorMsg && (
        <Alert
          type="error"
          title="Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE SPOUSE DOSSIER & SUB-SECTION NAVIGATION                          */}
      {/* ========================================================================= */}
      {activeSpouse && (
        <div className="space-y-6">
          {/* Active Spouse Focus Banner */}
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50/40 border border-sky-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-sky-600/20">
                {activeSpouse.name ? activeSpouse.name[0].toUpperCase() : 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {activeSpouse.name}
                  </h2>
                  <Badge variant={activeSpouse.status === 'MARRIED' ? 'success' : 'neutral'} size="sm">
                    {activeSpouse.status || 'MARRIED'}
                  </Badge>
                  {activeSpouse.isDependent && (
                    <Badge variant="primary" size="sm">Dependent</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Marriage Date: {activeSpouse.marriageDate ? activeSpouse.marriageDate.split('T')[0] : 'N/A'} • Nationality: {activeSpouse.nationality || 'PAKISTANI'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEditModal}
                className="text-xs border-slate-200 bg-white"
              >
                Edit Core Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSpouse}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white"
              >
                Remove Spouse
              </Button>
            </div>
          </div>

          {/* Sub-Section Horizontal Bar (Tier 3) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-2 shadow-2xs">
            <div className="flex items-center flex-wrap gap-1.5">
              {[
                { id: 'profile', label: 'Basic Profile', icon: '👤' },
                { id: 'present_address', label: 'Present Address', icon: '📍' },
                { id: 'permanent_address', label: 'Permanent Address', icon: '🏠' },
                { id: 'cnic', label: 'CNIC Registration', icon: '🆔' },
                { id: 'education', label: 'Education & Qualifications', icon: '🎓' },
              ].map((tab) => {
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none
                      ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. ACTIVE SUB-SECTION VIEW                                            */}
          {/* ===================================================================== */}
          {activeSubTab === 'profile' && (
            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base sm:text-lg">Spouse Core Profile</CardTitle>
                <CardDescription className="text-xs">
                  Legal marital identity, dependence status, and marriage verification dates for {activeSpouse.name}.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AlphaInput
                      label="Spouse Full Legal Name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />

                    <Select
                      label="Marital Status"
                      value={profileStatus}
                      onChange={(e) => setProfileStatus(e.target.value)}
                      options={[
                        { value: 'MARRIED', label: 'Married' },
                        { value: 'DIVORCED', label: 'Divorced' },
                        { value: 'WIDOWED', label: 'Widowed' },
                        { value: 'SEPARATED', label: 'Separated' },
                      ]}
                      required
                    />

                    <DateInput
                      label="Date of Marriage (Nikah)"
                      value={profileMarriageDate}
                      onChange={(e) => setProfileMarriageDate(e.target.value)}
                      disableFuture
                    />

                    <Input
                      label="Nationality"
                      value={profileNationality}
                      onChange={(e) => setProfileNationality(e.target.value)}
                      placeholder="PAKISTANI"
                    />

                    <div className="flex items-center gap-6 pt-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileIsDependent}
                          onChange={(e) => setProfileIsDependent(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                        />
                        <span>Financial Dependent on Employee</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileIsAlive}
                          onChange={(e) => setProfileIsAlive(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                        />
                        <span>Is Alive</span>
                      </label>
                    </div>

                    {!profileIsAlive && (
                      <DateInput
                        label="Date of Death"
                        value={profileDeathDate}
                        onChange={(e) => setProfileDeathDate(e.target.value)}
                        disableFuture
                      />
                    )}

                    <div className="md:col-span-2">
                      <Textarea
                        label="Audit Remarks / Nikahnama References"
                        value={profileNotes}
                        onChange={(e) => setProfileNotes(e.target.value)}
                        placeholder="Union council registration, witness names, or past status change notes..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/40 flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                    Save Spouse Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {activeSubTab === 'present_address' && (
            <FamilyAddressSubForm
              memberId={activeSpouse._id}
              memberName={activeSpouse.name}
              type="present"
            />
          )}

          {activeSubTab === 'permanent_address' && (
            <FamilyAddressSubForm
              memberId={activeSpouse._id}
              memberName={activeSpouse.name}
              type="permanent"
            />
          )}

          {activeSubTab === 'cnic' && (
            <FamilyCnicSubForm
              memberId={activeSpouse._id}
              memberName={activeSpouse.name}
              memberType="spouse"
            />
          )}

          {activeSubTab === 'education' && (
            <div className="space-y-4">
              <DataTable
                columns={eduColumns}
                data={educations}
                loading={eduLoading}
                searchPlaceholder="Search education degree or institute..."
                headerRight={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setEduModalOpen(true)}
                  >
                    + Add Spouse Education
                  </Button>
                }
              />

              <FormModal
                isOpen={eduModalOpen}
                onClose={() => setEduModalOpen(false)}
                title={`Add Education for ${activeSpouse.name}`}
                fields={[
                  { name: 'degree', label: 'Degree / Certificate', type: 'text', required: true, placeholder: 'e.g. Matric, FA, Bachelors' },
                  { name: 'institute', label: 'Institute / University', type: 'text', required: true, placeholder: 'e.g. Punjab University' },
                  { name: 'passingYear', label: 'Passing Year', type: 'text', placeholder: 'e.g. 2020' },
                ]}
                onSubmit={handleAddEducationSubmit}
                submitLabel="Save Education"
              />
            </div>
          )}
        </div>
      )}

      {/* Reusable FormModal Popup for Add/Edit Core Spouse */}
      <FormModal
        isOpen={coreModalOpen}
        onClose={() => setCoreModalOpen(false)}
        title={editingSpouse ? `Edit Spouse Details (${editingSpouse.name})` : 'Register New Spouse'}
        subtitle="Specify core marital identification and Nikah registration details."
        fields={spouseModalFields}
        initialValues={initialModalValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingSpouse ? 'Update Spouse' : 'Register Spouse'}
      />
    </div>
  );
}
