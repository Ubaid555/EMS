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

export default function HomeExpensePage() {
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
      const data = await financeService.getHomeExpenses();
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
    if (!window.confirm('Are you sure you want to delete this home expense record?')) return;
    try {
      await financeService.deleteHomeExpense(id);
      setSuccessMsg('Home expense record removed successfully.');
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
      label: 'Home Expense Title / Category',
      type: 'text',
      placeholder: 'e.g. House Rent, Utility Bills, Groceries, Children Education',
      required: true,
      helperText: 'Domestic expenditure category or title.',
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
      label: 'Monthly / Annual Amount (PKR)',
      type: 'number',
      placeholder: '45000',
      currency: 'PKR',
      required: true,
      helperText: 'Enter expense amount in PKR.',
    },
    {
      name: 'notes',
      label: 'Remarks / Breakdown (Optional)',
      type: 'textarea',
      placeholder: 'Utility consumer numbers, rental agreement references, etc...',
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
      await financeService.updateHomeExpense(editingExpense._id, payload);
      setSuccessMsg('Home expense record updated successfully.');
    } else {
      await financeService.addHomeExpense(payload);
      setSuccessMsg('New home expense recorded successfully.');
    }

    fetchExpenses();
  };

  const columns = [
    {
      key: 'title',
      label: 'Expense Item / Household Category',
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
        <span className="font-mono font-bold text-rose-700">
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
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEditModal(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-2xs"
            title="Edit expense"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
            title="Delete expense"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
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
              Home & Household Expenses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Declared domestic costs including residential rent, gas/electricity utilities, ration, and family expenses.
          </p>
        </div>

        {/* Aggregated Total Card */}
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200/80 px-4 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
            PKR
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Total Home Expenses
            </span>
            <span className="text-sm sm:text-base font-black text-rose-950 font-mono">
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
        searchPlaceholder="Search home expense title, category, remarks..."
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
            Add Home Expense
          </Button>
        }
      />

      {/* Reusable FormModal Popup */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Home Expense' : 'Add New Home Expense'}
        subtitle="Specify domestic expense item, fiscal year, and monetary amount."
        fields={expenseFields}
        initialValues={initialFormValues}
        onSubmit={handleModalSubmit}
        submitLabel={editingExpense ? 'Update Expense' : 'Save Expense'}
      />
    </div>
  );
}
