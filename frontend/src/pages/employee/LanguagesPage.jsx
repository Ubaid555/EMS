import React, { useState, useEffect } from 'react';
import {
  DataTable,
  FormModal,
  Button,
  Badge,
  Alert,
} from '@/components/common';
import employeeService from '@/services/employee.service';
import { parseApiError } from '@/utils/api-error';

export default function LanguagesPage() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);

  const fetchLanguages = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await employeeService.getLanguages();
      setLanguages(data || []);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleOpenAddModal = () => {
    setEditingLanguage(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (lang) => {
    setEditingLanguage(lang);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this language proficiency record?')) return;
    try {
      await employeeService.deleteLanguage(id);
      setSuccessMsg('Language record removed successfully.');
      fetchLanguages();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    }
  };

  const proficiencyOptions = [
    { value: 'LOW', label: 'Low (Basic Working Knowledge)' },
    { value: 'AVERAGE', label: 'Average (Professional Working)' },
    { value: 'HIGH', label: 'High (Fluent / Native)' },
  ];

  // Declarative Form Fields for Reusable FormModal
  const languageFields = [
    {
      name: 'name',
      label: 'Language Name',
      type: 'text',
      placeholder: 'e.g. English, Urdu, Arabic, Punjabi, French',
      required: true,
      helperText: 'Enter language name (will be automatically capitalized).',
    },
    // Speak capability
    {
      name: 'canSpeak',
      label: 'Can Speak this language',
      type: 'checkbox',
    },
    {
      name: 'speakingLevel',
      label: 'Speaking Proficiency Level',
      type: 'select',
      options: proficiencyOptions,
      condition: (vals) => Boolean(vals.canSpeak),
      helperText: 'Select current speaking capability level.',
    },
    // Write capability
    {
      name: 'canWrite',
      label: 'Can Write in this language',
      type: 'checkbox',
    },
    {
      name: 'writingLevel',
      label: 'Writing Proficiency Level',
      type: 'select',
      options: proficiencyOptions,
      condition: (vals) => Boolean(vals.canWrite),
      helperText: 'Select current written fluency level.',
    },
    // Read capability
    {
      name: 'canRead',
      label: 'Can Read this language',
      type: 'checkbox',
    },
    {
      name: 'readingLevel',
      label: 'Reading Proficiency Level',
      type: 'select',
      options: proficiencyOptions,
      condition: (vals) => Boolean(vals.canRead),
      helperText: 'Select reading and comprehension level.',
    },
    // Remarks
    {
      name: 'notes',
      label: 'Remarks / Certifications (Optional)',
      type: 'textarea',
      placeholder: 'e.g. IELTS 7.5, TOEFL, or mother tongue certification...',
      rows: 2,
    },
  ];

  // Map initial values when editing an existing language
  const initialFormValues = editingLanguage
    ? {
        name: editingLanguage.name || '',
        canSpeak: Boolean(editingLanguage.canSpeak),
        speakingLevel: editingLanguage.speakingLevel || 'AVERAGE',
        canWrite: Boolean(editingLanguage.canWrite),
        writingLevel: editingLanguage.writingLevel || 'AVERAGE',
        canRead: Boolean(editingLanguage.canRead),
        readingLevel: editingLanguage.readingLevel || 'AVERAGE',
        notes: editingLanguage.notes || '',
      }
    : {
        name: '',
        canSpeak: true,
        speakingLevel: 'HIGH',
        canWrite: true,
        writingLevel: 'HIGH',
        canRead: true,
        readingLevel: 'HIGH',
        notes: '',
      };

  const handleModalSubmit = async (formData) => {
    const payload = {
      name: formData.name ? formData.name.trim().toUpperCase() : '',
      canSpeak: Boolean(formData.canSpeak),
      speakingLevel: formData.canSpeak ? (formData.speakingLevel || 'AVERAGE') : undefined,
      canWrite: Boolean(formData.canWrite),
      writingLevel: formData.canWrite ? (formData.writingLevel || 'AVERAGE') : undefined,
      canRead: Boolean(formData.canRead),
      readingLevel: formData.canRead ? (formData.readingLevel || 'AVERAGE') : undefined,
      notes: formData.notes ? formData.notes.trim() : undefined,
    };

    if (editingLanguage?._id) {
      await employeeService.updateLanguage(editingLanguage._id, payload);
      setSuccessMsg(`Language "${payload.name}" updated successfully.`);
    } else {
      await employeeService.createLanguage(payload);
      setSuccessMsg(`Language "${payload.name}" added successfully.`);
    }

    fetchLanguages();
  };

  const renderProficiencyBadge = (capable, level, label) => {
    if (!capable) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          No {label}
        </span>
      );
    }
    const color =
      level === 'HIGH'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : level === 'AVERAGE'
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${color}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {label}: {level || 'YES'}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Language',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 tracking-tight text-sm uppercase">{val}</span>
        </div>
      ),
    },
    {
      key: 'skills',
      label: 'Competency & Proficiency Levels',
      render: (_, row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {renderProficiencyBadge(row.canSpeak, row.speakingLevel, 'Speak')}
          {renderProficiencyBadge(row.canWrite, row.writingLevel, 'Write')}
          {renderProficiencyBadge(row.canRead, row.readingLevel, 'Read')}
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Remarks / Notes',
      render: (val) => (
        <span className="text-xs text-slate-600 line-clamp-1">{val || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Row Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline px-2 py-1 rounded bg-sky-50 border border-sky-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 rounded bg-rose-50 border border-rose-200"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Employee Languages
            </h1>
            <Badge variant="primary">Section 06</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official linguistic competencies, spoken/written proficiencies, and reading fluency.
          </p>
        </div>
      </div>

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

      {/* Multiple Data Table */}
      <DataTable
        columns={columns}
        data={languages}
        loading={loading}
        searchPlaceholder="Search language name or remarks..."
        pageSizeOptions={[10, 25, 50, 100]}
        headerRight={
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
            Add New Language
          </Button>
        }
      />

      {/* Reusable FormModal Popup */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLanguage ? `Edit Language (${editingLanguage.name})` : 'Add New Language Proficiency'}
        subtitle="Specify language name and speaking, writing, and reading proficiencies."
        fields={languageFields}
        initialValues={initialFormValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingLanguage ? 'Update Language' : 'Save Language'}
      />
    </div>
  );
}
