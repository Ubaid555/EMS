import React, { useState } from 'react';
import {
  DataTable,
  SlideOverDrawer,
  Button,
  Input,
  DateInput,
  Badge,
} from '@/components/common';

export default function ServiceHistoryPage() {
  const [services, setServices] = useState([
    {
      _id: '1',
      designation: 'Senior Lecturer',
      department: 'Computer Science Department',
      fromDate: '2021-08-01',
      toDate: 'Present',
      status: 'CURRENT',
    },
    {
      _id: '2',
      designation: 'Assistant Lecturer',
      department: 'Information Technology',
      fromDate: '2019-01-15',
      toDate: '2021-07-31',
      status: 'COMPLETED',
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddService = (e) => {
    e.preventDefault();
    if (!designation || !department) return;

    setSaving(true);
    setTimeout(() => {
      const newRecord = {
        _id: String(Date.now()),
        designation,
        department,
        fromDate: fromDate || '2023-01-01',
        toDate: toDate || 'Present',
        status: toDate ? 'COMPLETED' : 'CURRENT',
      };
      setServices((prev) => [newRecord, ...prev]);
      setSaving(false);
      setDrawerOpen(false);
      setDesignation('');
      setDepartment('');
      setFromDate('');
      setToDate('');
    }, 300);
  };

  const columns = [
    { key: 'designation', label: 'Designation / Post', sortable: true },
    { key: 'department', label: 'Department / Faculty', sortable: true },
    { key: 'fromDate', label: 'Effective From' },
    { key: 'toDate', label: 'To Date' },
    {
      key: 'status',
      label: 'Service Status',
      render: (val) => (
        <Badge variant={val === 'CURRENT' ? 'success' : 'neutral'} size="sm">
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
          onClick={() => setServices((prev) => prev.filter((s) => s._id !== row._id))}
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
              Service History & Career Records
            </h1>
            <Badge variant="primary">Form 10 • Multi-Record</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical career milestones, internal transfers, and departmental postings.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={services}
        searchPlaceholder="Search designation or department..."
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
            Add Service Record
          </Button>
        }
      />

      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Service Posting"
        description="Enter designation, department, and tenure period."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleAddService}>
              Save Posting
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddService} className="space-y-4">
          <Input
            label="Designation / Post"
            placeholder="e.g. Associate Professor"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />
          <Input
            label="Department / Faculty"
            placeholder="e.g. Faculty of Sciences"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
          <DateInput
            label="Posting Start Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <DateInput
            label="Posting End Date (Leave empty if Current)"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </form>
      </SlideOverDrawer>
    </div>
  );
}
