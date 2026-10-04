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

export default function OtherExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await financeService.getOtherExpenses();
      setExpenses(data || []);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingExpense(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this other expense record?')) return;
    try {
      await financeService.deleteOtherExpense(id);
      setSuccessMsg('Other expense record removed successfully.');
      fetchExpenses();
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
  const expenseFields = [
    {
      name: 'title',
      label: 'Other Expense Item / Description',
      type: 'text',
      placeholder: 'e.g. Vehicle Fuel & Maintenance, Medical, Travel, Professional Dues',
      required: true,
      helperText: 'Discretionary, commercial, medical, or miscellaneous expenditure title.',
    },
    {
      name: 'year',
      label: 'Financial Year',
      type: 'select',
      options: yearOptions,
      required: true,
      placeholder: 'Select Year...',
      helperText: 'Fiscal or calendar year of this expense.',
    },
    {
      name: 'amount',
      label: 'Amount (PKR)',
      type: 'number',
      placeholder: '25000',
      currency: 'PKR',
      required: true,
      helperText: 'Enter expense amount in PKR.',
    },
    {
      name: 'notes',
      label: 'Remarks / Reference (Optional)',
      type: 'textarea',
      placeholder: 'Receipt numbers, clinical invoice, insurance claims...',
      rows: 2,
    },
  ];

  const initialFormValues = editingExpense
    ? {
        title: editingExpense.title || '',
        year: typeof editingExpense.year === 'object' ? editingExpense.year?.code : (editingExpense.year || '2026'),
        amount: editingExpense.amount ?? '',
        notes: editingExpense.notes || '',
      }
    : {
        title: '',
        year: '2026',
        amount: '',
        notes: '',
      };

  const handleModalSubmit = async (formData) => {
    const payload = {
      title: formData.title.trim(),
      year: formData.year,
      amount: Number(formData.amount),
      notes: formData.notes ? formData.notes.trim() : undefined,
    };

    if (editingExpense?._id) {
      await financeService.updateOtherExpense(editingExpense._id, payload);
      setSuccessMsg('Other expense record updated successfully.');
    } else {
      await financeService.addOtherExpense(payload);
      setSuccessMsg('New other expense recorded successfully.');
    }

    fetchExpenses();
  };

  const columns = [
    {
      key: 'title',
      label: 'Expense Item / Designation',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-slate-900 block">{val}</span>
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
        <span className="font-mono font-bold text-amber-700">
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
      {/* Sub-Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Other & Discretionary Expenses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Declared non-residential expenditures including medical, insurance, vehicle upkeep, taxes, and travel.
          </p>
        </div>

        {/* Aggregated Total Card */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
            PKR
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Total Other Expenses
            </span>
            <span className="text-sm sm:text-base font-black text-amber-950 font-mono">
              {formatCurrency(totalExpense, 'PKR')}
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
        data={expenses}
        loading={loading}
        searchPlaceholder="Search other expense title, description, remarks..."
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
            Add Other Expense
          </Button>
        }
      />

      {/* Reusable FormModal Popup */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Other Expense' : 'Add New Other Expense'}
        subtitle="Specify discretionary or miscellaneous expenditure item, fiscal year, and amount."
        fields={expenseFields}
        initialValues={initialFormValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingExpense ? 'Update Expense' : 'Save Expense'}
      />
    </div>
  );
}
