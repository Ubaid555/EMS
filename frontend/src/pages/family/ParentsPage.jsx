import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  AlphaInput,
  DateInput,
  Select,
  Textarea,
  Badge,
  Alert,
  FormModal,
} from '@/components/common';
import familyService from '@/services/family.service';
import { parseApiError } from '@/utils/api-error';
import FamilyAddressSubForm from './FamilyAddressSubForm';
import FamilyCnicSubForm from './FamilyCnicSubForm';

export default function ParentsPage() {
  const [parents, setParents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'present_address' | 'permanent_address' | 'cnic'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Add/Edit Parent Modal
  const [coreModalOpen, setCoreModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  // Basic Profile Form fields for active parent
  const [profileName, setProfileName] = useState('');
  const [profileParentType, setProfileParentType] = useState('FATHER');
  const [profileLineageType, setProfileLineageType] = useState('BIOLOGICAL');
  const [profileIsDependent, setProfileIsDependent] = useState(true);
  const [profileIsAlive, setProfileIsAlive] = useState(true);
  const [profileDeathDate, setProfileDeathDate] = useState('');
  const [profileNotes, setProfileNotes] = useState('');

  const fetchParents = async (targetSelectId = null) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await familyService.getParents();
      const list = Array.isArray(data) ? data : [];
      setParents(list);

      if (list.length > 0) {
        if (targetSelectId && list.some((p) => p._id === targetSelectId)) {
          setSelectedParentId(targetSelectId);
        } else if (!selectedParentId || !list.some((p) => p._id === selectedParentId)) {
          setSelectedParentId(list[0]._id);
        }
      } else {
        setSelectedParentId(null);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const activeParent = useMemo(() => {
    return parents.find((p) => p._id === selectedParentId) || null;
  }, [parents, selectedParentId]);

  useEffect(() => {
    if (activeParent) {
      setProfileName(activeParent.name || '');
      setProfileParentType(activeParent.parentType || 'FATHER');
      setProfileLineageType(activeParent.lineageType || 'BIOLOGICAL');
      setProfileIsDependent(activeParent.isDependent ?? true);
      setProfileIsAlive(activeParent.isAlive ?? true);
      setProfileDeathDate(
        activeParent.deathDate ? activeParent.deathDate.split('T')[0] : ''
      );
      setProfileNotes(activeParent.notes || '');
    }
  }, [activeParent]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!activeParent?._id) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!profileName.trim()) {
      setErrorMsg('Parent full legal name is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profileName.trim(),
        parentType: profileParentType,
        lineageType: profileLineageType,
        isDependent: Boolean(profileIsDependent),
        isAlive: Boolean(profileIsAlive),
        deathDate: !profileIsAlive && profileDeathDate ? profileDeathDate : undefined,
        notes: profileNotes.trim() || undefined,
      };

      await familyService.updateParent(activeParent._id, payload);
      setSuccessMsg(`Profile for ${payload.name} updated successfully.`);
      fetchParents(activeParent._id);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message || 'Failed to update parent profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingParent(null);
    setCoreModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!activeParent) return;
    setEditingParent(activeParent);
    setCoreModalOpen(true);
  };

  const handleDeleteParent = async () => {
    if (!activeParent) return;
    if (!window.confirm(`Are you sure you want to remove parent "${activeParent.name}" from employee records?`)) {
      return;
    }

    try {
      await familyService.deleteParent(activeParent._id);
      setSuccessMsg(`Parent "${activeParent.name}" removed successfully.`);
      fetchParents();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message || 'Failed to remove parent.');
    }
  };

  // Declarative fields for Add/Edit Parent Popup Modal
  const parentModalFields = [
    {
      name: 'name',
      label: 'Parent Full Legal Name',
      type: 'alpha',
      placeholder: 'e.g. Abdul Rehman',
      required: true,
      helperText: 'Full legal name registered on CNIC.',
    },
    {
      name: 'parentType',
      label: 'Parent Classification',
      type: 'select',
      required: true,
      options: [
        { value: 'FATHER', label: 'Father' },
        { value: 'MOTHER', label: 'Mother' },
      ],
    },
    {
      name: 'lineageType',
      label: 'Lineage / Relationship Type',
      type: 'select',
      required: true,
      options: [
        { value: 'BIOLOGICAL', label: 'Biological (Own Parent)' },
        { value: 'ADOPTED', label: 'Adopted' },
        { value: 'STEP', label: 'Step Parent' },
      ],
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
      label: 'Audit Remarks / Medical Care References',
      type: 'textarea',
      placeholder: 'Pension status, medical dependency references...',
      rows: 2,
    },
  ];

  const initialModalValues = editingParent
    ? {
        name: editingParent.name || '',
        parentType: editingParent.parentType || 'FATHER',
        lineageType: editingParent.lineageType || 'BIOLOGICAL',
        isDependent: editingParent.isDependent ?? true,
        isAlive: editingParent.isAlive ?? true,
        notes: editingParent.notes || '',
      }
    : {
        name: '',
        parentType: 'FATHER',
        lineageType: 'BIOLOGICAL',
        isDependent: true,
        isAlive: true,
        notes: '',
      };

  const handleModalSubmit = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      parentType: formData.parentType,
      lineageType: formData.lineageType,
      isDependent: Boolean(formData.isDependent),
      isAlive: Boolean(formData.isAlive),
      notes: formData.notes ? formData.notes.trim() : undefined,
    };

    if (editingParent?._id) {
      await familyService.updateParent(editingParent._id, payload);
      setSuccessMsg(`Parent "${payload.name}" updated successfully.`);
      fetchParents(editingParent._id);
    } else {
      const created = await familyService.addParent(payload);
      setSuccessMsg(`Parent "${payload.name}" registered successfully.`);
      fetchParents(created?._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. MASTER PARENTS SELECTOR (Handles Father, Mother, Step-parents)         */}
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
                Parents Registry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Parents Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an existing parent below or register a parent to manage their individual profile, address, and CNIC.
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
            Add New Parent
          </Button>
        </div>

        {/* Member List / Selector Chips */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading registered parents...</div>
        ) : parents.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
            <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">No Parent Registered</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Add New Parent" to register father or mother records.</p>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Parents Records ({parents.length}):
            </span>
            {parents.map((p, index) => {
              const isSelected = p._id === selectedParentId;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setSelectedParentId(p._id)}
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
                  <span>{p.name}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.parentType} • {p.lineageType || 'BIOLOGICAL'}
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
      {/* 2. ACTIVE PARENT DOSSIER & SUB-SECTION NAVIGATION                          */}
      {/* ========================================================================= */}
      {activeParent && (
        <div className="space-y-6">
          {/* Active Parent Focus Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50/40 border border-purple-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-purple-600/20">
                {activeParent.name ? activeParent.name[0].toUpperCase() : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {activeParent.name}
                  </h2>
                  <Badge variant="primary" size="sm">
                    {activeParent.parentType}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {activeParent.lineageType || 'BIOLOGICAL'}
                  </Badge>
                  {activeParent.isDependent && (
                    <Badge variant="success" size="sm">Dependent</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Relationship: {activeParent.parentType === 'FATHER' ? 'Father' : 'Mother'} ({activeParent.lineageType || 'Biological'}) • Status: {activeParent.isAlive ? 'Alive' : 'Deceased'}
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
                onClick={handleDeleteParent}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white"
              >
                Remove Parent
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
                { id: 'cnic', label: 'National ID (CNIC)', icon: '🆔' },
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
                <CardTitle className="text-base sm:text-lg">Parent Core Profile</CardTitle>
                <CardDescription className="text-xs">
                  Parentage classification, lineage validation, and dependence declarations for {activeParent.name}.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AlphaInput
                      label="Parent Full Legal Name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />

                    <Select
                      label="Parent Classification"
                      value={profileParentType}
                      onChange={(e) => setProfileParentType(e.target.value)}
                      options={[
                        { value: 'FATHER', label: 'Father' },
                        { value: 'MOTHER', label: 'Mother' },
                      ]}
                      required
                    />

                    <Select
                      label="Lineage Relationship"
                      value={profileLineageType}
                      onChange={(e) => setProfileLineageType(e.target.value)}
                      options={[
                        { value: 'BIOLOGICAL', label: 'Biological (Own Parent)' },
                        { value: 'ADOPTED', label: 'Adopted' },
                        { value: 'STEP', label: 'Step Parent' },
                      ]}
                      required
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
                        label="Audit Remarks / Notes"
                        value={profileNotes}
                        onChange={(e) => setProfileNotes(e.target.value)}
                        placeholder="Pensioner status, medical history, or family dependence notes..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/40 flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                    Save Parent Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {activeSubTab === 'present_address' && (
            <FamilyAddressSubForm
              memberId={activeParent._id}
              memberName={activeParent.name}
              type="present"
            />
          )}

          {activeSubTab === 'permanent_address' && (
            <FamilyAddressSubForm
              memberId={activeParent._id}
              memberName={activeParent.name}
              type="permanent"
            />
          )}

          {activeSubTab === 'cnic' && (
            <FamilyCnicSubForm
              memberId={activeParent._id}
              memberName={activeParent.name}
              memberType="parent"
            />
          )}
        </div>
      )}

      {/* Reusable FormModal Popup for Add/Edit Core Parent */}
      <FormModal
        isOpen={coreModalOpen}
        onClose={() => setCoreModalOpen(false)}
        title={editingParent ? `Edit Parent Details (${editingParent.name})` : 'Register New Parent'}
        subtitle="Specify parent classification, lineage type, and legal identification."
        fields={parentModalFields}
        initialValues={initialModalValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingParent ? 'Update Parent' : 'Register Parent'}
      />
    </div>
  );
}
