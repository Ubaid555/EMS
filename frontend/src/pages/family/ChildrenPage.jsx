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
  FormModal,
} from '@/components/common';
import familyService from '@/services/family.service';
import { parseApiError } from '@/utils/api-error';
import FamilyAddressSubForm from './FamilyAddressSubForm';
import FamilyCnicSubForm from './FamilyCnicSubForm';

export default function ChildrenPage() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'present_address' | 'permanent_address' | 'cnic'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Add/Edit Child Modal
  const [coreModalOpen, setCoreModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  // Basic Profile Form fields for active child
  const [profileName, setProfileName] = useState('');
  const [profileGender, setProfileGender] = useState('MALE');
  const [profileDob, setProfileDob] = useState('');
  const [profileChildType, setProfileChildType] = useState('BIOLOGICAL');
  const [profileOrder, setProfileOrder] = useState('1');
  const [profileIsDependent, setProfileIsDependent] = useState(true);
  const [profileIsAlive, setProfileIsAlive] = useState(true);
  const [profileDeathDate, setProfileDeathDate] = useState('');
  const [profileMaritalStatus, setProfileMaritalStatus] = useState('SINGLE');
  const [profileNotes, setProfileNotes] = useState('');

  const fetchChildren = async (targetSelectId = null) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await familyService.getChildren();
      const list = Array.isArray(data) ? data : [];
      setChildren(list);

      if (list.length > 0) {
        if (targetSelectId && list.some((c) => c._id === targetSelectId)) {
          setSelectedChildId(targetSelectId);
        } else if (!selectedChildId || !list.some((c) => c._id === selectedChildId)) {
          setSelectedChildId(list[0]._id);
        }
      } else {
        setSelectedChildId(null);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const activeChild = useMemo(() => {
    return children.find((c) => c._id === selectedChildId) || null;
  }, [children, selectedChildId]);

  useEffect(() => {
    if (activeChild) {
      setProfileName(activeChild.name || '');
      setProfileGender(activeChild.gender || 'MALE');
      setProfileDob(activeChild.dateOfBirth ? activeChild.dateOfBirth.split('T')[0] : '');
      setProfileChildType(activeChild.childType || 'BIOLOGICAL');
      setProfileOrder(String(activeChild.orderOfBirth || 1));
      setProfileIsDependent(activeChild.isDependent ?? true);
      setProfileIsAlive(activeChild.isAlive ?? true);
      setProfileDeathDate(
        activeChild.deathDate ? activeChild.deathDate.split('T')[0] : ''
      );
      setProfileMaritalStatus(activeChild.maritalStatus || 'SINGLE');
      setProfileNotes(activeChild.notes || '');
    }
  }, [activeChild]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!activeChild?._id) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!profileName.trim()) {
      setErrorMsg('Child full name is required.');
      return;
    }
    if (!profileDob) {
      setErrorMsg('Child date of birth is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profileName.trim(),
        gender: profileGender,
        dateOfBirth: profileDob,
        childType: profileChildType,
        orderOfBirth: Number(profileOrder) || 1,
        isDependent: Boolean(profileIsDependent),
        isAlive: Boolean(profileIsAlive),
        deathDate: !profileIsAlive && profileDeathDate ? profileDeathDate : undefined,
        maritalStatus: profileMaritalStatus,
        notes: profileNotes.trim() || undefined,
      };

      await familyService.updateChild(activeChild._id, payload);
      setSuccessMsg(`Profile for ${payload.name} updated successfully.`);
      fetchChildren(activeChild._id);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message || 'Failed to update child profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingChild(null);
    setCoreModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!activeChild) return;
    setEditingChild(activeChild);
    setCoreModalOpen(true);
  };

  const handleDeleteChild = async () => {
    if (!activeChild) return;
    if (!window.confirm(`Are you sure you want to remove child "${activeChild.name}" from employee records?`)) {
      return;
    }

    try {
      await familyService.deleteChild(activeChild._id);
      setSuccessMsg(`Child "${activeChild.name}" removed successfully.`);
      fetchChildren();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message || 'Failed to remove child.');
    }
  };

  // Declarative fields for Add/Edit Child Popup Modal
  const childModalFields = [
    {
      name: 'name',
      label: 'Child Full Name',
      type: 'alpha',
      placeholder: 'e.g. Muhammad Ali',
      required: true,
      helperText: 'Legal name registered on NADRA B-Form or birth certificate.',
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      options: [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
      ],
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      disableFuture: true,
    },
    {
      name: 'childType',
      label: 'Child Lineage Type',
      type: 'select',
      required: true,
      options: [
        { value: 'BIOLOGICAL', label: 'Biological (Own child)' },
        { value: 'ADOPTED', label: 'Adopted' },
        { value: 'STEP_CHILD', label: 'Step Child' },
      ],
    },
    {
      name: 'orderOfBirth',
      label: 'Order of Birth (1 = Eldest, 2 = Second...)',
      type: 'number',
      placeholder: '1',
      required: true,
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
      label: 'Birth Certificate / Remarks',
      type: 'textarea',
      placeholder: 'Hospital birth slip number, Nadra B-Form tracking code...',
      rows: 2,
    },
  ];

  const initialModalValues = editingChild
    ? {
        name: editingChild.name || '',
        gender: editingChild.gender || 'MALE',
        dateOfBirth: editingChild.dateOfBirth ? editingChild.dateOfBirth.split('T')[0] : '',
        childType: editingChild.childType || 'BIOLOGICAL',
        orderOfBirth: editingChild.orderOfBirth || 1,
        isDependent: editingChild.isDependent ?? true,
        isAlive: editingChild.isAlive ?? true,
        notes: editingChild.notes || '',
      }
    : {
        name: '',
        gender: 'MALE',
        dateOfBirth: '',
        childType: 'BIOLOGICAL',
        orderOfBirth: children.length + 1,
        isDependent: true,
        isAlive: true,
        notes: '',
      };

  const handleModalSubmit = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      childType: formData.childType,
      orderOfBirth: Number(formData.orderOfBirth) || 1,
      isDependent: Boolean(formData.isDependent),
      isAlive: Boolean(formData.isAlive),
      notes: formData.notes ? formData.notes.trim() : undefined,
    };

    if (editingChild?._id) {
      await familyService.updateChild(editingChild._id, payload);
      setSuccessMsg(`Child "${payload.name}" updated successfully.`);
      fetchChildren(editingChild._id);
    } else {
      const created = await familyService.addChild(payload);
      setSuccessMsg(`Child "${payload.name}" registered successfully.`);
      fetchChildren(created?._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. MASTER CHILDREN SELECTOR (Handles multiple children)                    */}
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
                Children Registry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Children Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an existing child below or register another child to update their individual dossier and address.
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
            Add New Child
          </Button>
        </div>

        {/* Member List / Selector Chips */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading registered children...</div>
        ) : children.length === 0 ? (
          <div className="py-10 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 mt-4 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">No Child Records Registered</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Begin by registering the employee's children to maintain their dependent information, identity records, and addresses.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
              + Register First Child
            </Button>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Children Records ({children.length}):
            </span>
            {children.map((c, index) => {
              const isSelected = c._id === selectedChildId;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setSelectedChildId(c._id)}
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
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.gender} • {c.childType || 'BIOLOGICAL'}
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
      {/* 2. ACTIVE CHILD DOSSIER & SUB-SECTION NAVIGATION                           */}
      {/* ========================================================================= */}
      {activeChild && (
        <div className="space-y-6">
          {/* Active Child Focus Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/40 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-emerald-600/20">
                {activeChild.name ? activeChild.name[0].toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {activeChild.name}
                  </h2>
                  <Badge variant="primary" size="sm">
                    {activeChild.gender}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {activeChild.childType || 'BIOLOGICAL'}
                  </Badge>
                  {activeChild.isDependent && (
                    <Badge variant="success" size="sm">Dependent</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date of Birth: {activeChild.dateOfBirth ? activeChild.dateOfBirth.split('T')[0] : 'N/A'} • Birth Order: #{activeChild.orderOfBirth || 1}
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
                onClick={handleDeleteChild}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white"
              >
                Remove Child
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
                { id: 'cnic', label: 'B-Form / Child CNIC', icon: '🆔' },
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
                <CardTitle className="text-base sm:text-lg">Child Core Profile</CardTitle>
                <CardDescription className="text-xs">
                  Legal birth registration, lineage classification, and dependence records for {activeChild.name}.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AlphaInput
                      label="Child Full Legal Name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />

                    <Select
                      label="Gender"
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      options={[
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                      ]}
                      required
                    />

                    <DateInput
                      label="Date of Birth"
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                      disableFuture
                      required
                    />

                    <Select
                      label="Child Lineage Type"
                      value={profileChildType}
                      onChange={(e) => setProfileChildType(e.target.value)}
                      options={[
                        { value: 'BIOLOGICAL', label: 'Biological (Own Child)' },
                        { value: 'ADOPTED', label: 'Adopted' },
                        { value: 'STEP_CHILD', label: 'Step Child' },
                      ]}
                      required
                    />

                    <Input
                      label="Birth Order (1 = Eldest)"
                      type="number"
                      value={profileOrder}
                      onChange={(e) => setProfileOrder(e.target.value)}
                      required
                    />

                    <Select
                      label="Marital Status"
                      value={profileMaritalStatus}
                      onChange={(e) => setProfileMaritalStatus(e.target.value)}
                      options={[
                        { value: 'SINGLE', label: 'Single' },
                        { value: 'MARRIED', label: 'Married' },
                      ]}
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
                        label="Audit Remarks / Birth Certificate Notes"
                        value={profileNotes}
                        onChange={(e) => setProfileNotes(e.target.value)}
                        placeholder="NADRA B-Form registration reference, hospital certification..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/40 flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                    Save Child Profile
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {activeSubTab === 'present_address' && (
            <FamilyAddressSubForm
              memberId={activeChild._id}
              memberName={activeChild.name}
              type="present"
            />
          )}

          {activeSubTab === 'permanent_address' && (
            <FamilyAddressSubForm
              memberId={activeChild._id}
              memberName={activeChild.name}
              type="permanent"
            />
          )}

          {activeSubTab === 'cnic' && (
            <FamilyCnicSubForm
              memberId={activeChild._id}
              memberName={activeChild.name}
              memberType="child"
            />
          )}
        </div>
      )}

      {/* Reusable FormModal Popup for Add/Edit Core Child */}
      <FormModal
        isOpen={coreModalOpen}
        onClose={() => setCoreModalOpen(false)}
        title={editingChild ? `Edit Child Details (${editingChild.name})` : 'Register New Child'}
        subtitle="Specify child identity, gender, date of birth, and lineage type."
        fields={childModalFields}
        initialValues={initialModalValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingChild ? 'Update Child' : 'Register Child'}
      />
    </div>
  );
}
