import React, { useState, useEffect, useMemo } from 'react';
import {
  DataTable,
  FormModal,
  Button,
  Badge,
  Alert,
} from '@/components/common';
import { formatCurrency } from '@/utils/validators';
import financeService from '@/services/finance.service';
import { parseApiError } from '@/utils/api-error';

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const fetchIncomes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await financeService.getIncomes();
      setIncomes(data || []);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const totalIncome = useMemo(() => {
    return incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [incomes]);

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingIncome(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      await financeService.deleteIncome(id);
      setSuccessMsg('Income record deleted successfully.');
      fetchIncomes();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    }
  };

  const yearOptions = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
  ];

  // Declarative Form Fields for Reusable FormModal
  const incomeFields = [
    {
      name: 'title',
      label: 'Income Title / Designation',
      type: 'text',
      placeholder: 'e.g. Base University Salary, Research Grant, Consultation',
      required: true,
      helperText: 'A descriptive title for this income declaration.',
    },
    {
      name: 'source',
      label: 'Income Source / Organization',
      type: 'text',
      placeholder: 'e.g. Higher Education Commission, University Payroll, Freelance',
      required: true,
      helperText: 'Disbursing entity or origin of funds.',
    },
    {
      name: 'year',
      label: 'Financial Year',
      type: 'select',
      options: yearOptions,
      required: true,
      placeholder: 'Select Year...',
      helperText: 'Select calendar or fiscal year.',
    },
    {
      name: 'amount',
      label: 'Income Amount (PKR)',
      type: 'number',
      placeholder: '150000',
      currency: 'PKR',
      required: true,
      helperText: 'Enter numerical amount in PKR (non-negative).',
    },
    {
      name: 'notes',
      label: 'Audit Remarks / Notes (Optional)',
      type: 'textarea',
      placeholder: 'Tax deductions, allowance breakdowns, or reference voucher numbers...',
      rows: 2,
    },
  ];

  const initialFormValues = editingIncome
    ? {
        title: editingIncome.title || '',
        source: editingIncome.source || '',
        year: typeof editingIncome.year === 'object' ? editingIncome.year?.code : (editingIncome.year || '2026'),
        amount: editingIncome.amount ?? '',
        notes: editingIncome.notes || '',
      }
    : {
        title: '',
        source: '',
        year: '2026',
        amount: '',
        notes: '',
      };

  const handleModalSubmit = async (formData) => {
    const payload = {
      title: formData.title.trim(),
      source: formData.source.trim(),
      year: formData.year,
      amount: Number(formData.amount),
      notes: formData.notes ? formData.notes.trim() : undefined,
    };

    if (editingIncome?._id) {
      await financeService.updateIncome(editingIncome._id, payload);
      setSuccessMsg('Income record updated successfully.');
    } else {
      await financeService.addIncome(payload);
      setSuccessMsg('New income record declared successfully.');
    }

    fetchIncomes();
  };

  const columns = [
    {
      key: 'title',
      label: 'Income Title & Source',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-xs text-slate-500 block">Source: {row.source || '—'}</span>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Fiscal Year',
      sortable: true,
      render: (val) => (
        <Badge variant="primary" size="sm">
          {typeof val === 'object' && val !== null ? val.label || val.code : val || 'Current'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount (PKR)',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-emerald-700">
          {formatCurrency(val, 'PKR')}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Remarks',
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Income Streams
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official declared salaries, research remuneration, consultancy, and other earning sources.
          </p>
        </div>

        {/* Aggregated Total Card */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            PKR
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Total Declared Income
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-950 font-mono">
              {formatCurrency(totalIncome, 'PKR')}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <Alert
          type="success"
          title="Success"
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
        data={incomes}
        loading={loading}
        searchPlaceholder="Search income title, source or year..."
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
            Add Income Record
          </Button>
        }
      />

      {/* Reusable FormModal Popup */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIncome ? 'Edit Income Record' : 'Declare New Income Record'}
        subtitle="Specify income stream details, disbursement source, fiscal year, and amount."
        fields={incomeFields}
        initialValues={initialFormValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingIncome ? 'Update Income' : 'Save Income'}
      />
    </div>
  );
}
