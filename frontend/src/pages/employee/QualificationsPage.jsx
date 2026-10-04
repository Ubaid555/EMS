import React, { useState } from 'react';
import {
  DataTable,
  SlideOverDrawer,
  Button,
  Input,
  LookupSelect,
  Badge,
  Alert,
} from '@/components/common';

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState([
    {
      _id: '1',
      degreeTitle: 'Master of Science in Computer Science',
      institution: 'University of the Punjab',
      passingYear: '2020',
      gradeOrCgpa: '3.85 CGPA',
      status: 'VERIFIED',
    },
    {
      _id: '2',
      degreeTitle: 'Bachelor of Science in Information Tech',
      institution: 'FAST NUCES',
      passingYear: '2018',
      gradeOrCgpa: '3.60 CGPA',
      status: 'VERIFIED',
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [degreeTitle, setDegreeTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [gradeOrCgpa, setGradeOrCgpa] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddQualification = (e) => {
    e.preventDefault();
    if (!degreeTitle || !institution) return;

    setSaving(true);
    setTimeout(() => {
      const newRecord = {
        _id: String(Date.now()),
        degreeTitle,
        institution,
        passingYear: passingYear || '2022',
        gradeOrCgpa: gradeOrCgpa || 'A Grade',
        status: 'PENDING',
      };
      setQualifications((prev) => [newRecord, ...prev]);
      setSaving(false);
      setDrawerOpen(false);
      setDegreeTitle('');
      setInstitution('');
      setPassingYear('');
      setGradeOrCgpa('');
    }, 300);
  };

  const handleDelete = (id) => {
    setQualifications((prev) => prev.filter((q) => q._id !== id));
  };

  const columns = [
    { key: 'degreeTitle', label: 'Degree / Certificate', sortable: true },
    { key: 'institution', label: 'Board / University', sortable: true },
    { key: 'passingYear', label: 'Passing Year', sortable: true },
    { key: 'gradeOrCgpa', label: 'Grade / CGPA' },
    {
      key: 'status',
      label: 'Audit Status',
      render: (val) => (
        <Badge variant={val === 'VERIFIED' ? 'success' : 'warning'} size="sm">
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleDelete(row._id)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Academics & Educational Qualifications
            </h1>
            <Badge variant="primary">Form 4 • Multi-Record</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered degrees, board certificates, and accredited diplomas.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={qualifications}
        searchPlaceholder="Search by degree, university, year..."
        headerRight={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Qualification
          </Button>
        }
      />

      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Academic Qualification"
        description="Enter degree title, awarding body or university, and passing year."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleAddQualification}>
              Save Qualification
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddQualification} className="space-y-4">
          <Input
            label="Degree Title / Certificate"
            placeholder="e.g. Master of Business Administration"
            value={degreeTitle}
            onChange={(e) => setDegreeTitle(e.target.value)}
            required
          />
          <Input
            label="Awarding Institution / University"
            placeholder="e.g. Punjab University"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />
          <LookupSelect
            category="YEAR"
            label="Passing Year"
            value={passingYear}
            onChange={(e) => setPassingYear(e.target.value)}
          />
          <Input
            label="Grade / Division / CGPA"
            placeholder="e.g. 3.75 CGPA or Grade A"
            value={gradeOrCgpa}
            onChange={(e) => setGradeOrCgpa(e.target.value)}
          />
        </form>
      </SlideOverDrawer>
    </div>
  );
}
