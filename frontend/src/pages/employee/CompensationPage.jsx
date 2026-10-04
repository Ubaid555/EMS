import React, { useState } from 'react';
import {
  DataTable,
  SlideOverDrawer,
  Button,
  NumberInput,
  DateInput,
  Badge,
} from '@/components/common';
import { formatCurrency } from '@/utils/validators';

export default function CompensationPage() {
  const [compensations, setCompensations] = useState([
    {
      _id: '1',
      scale: 'BPS-18',
      basicPay: 125000,
      allowances: 35000,
      deductions: 8000,
      netPay: 152000,
      effectiveDate: '2023-07-01',
      status: 'ACTIVE',
    },
    {
      _id: '2',
      scale: 'BPS-17',
      basicPay: 95000,
      allowances: 25000,
      deductions: 6000,
      netPay: 114000,
      effectiveDate: '2021-07-01',
      status: 'SUPERSEDED',
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [basicPay, setBasicPay] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddCompensation = (e) => {
    e.preventDefault();
    if (!basicPay) return;

    setSaving(true);
    setTimeout(() => {
      const b = Number(basicPay) || 0;
      const a = Number(allowances) || 0;
      const d = Number(deductions) || 0;
      const net = b + a - d;

      const newRecord = {
        _id: String(Date.now()),
        scale: 'BPS-18 (Revision)',
        basicPay: b,
        allowances: a,
        deductions: d,
        netPay: net,
        effectiveDate: effectiveDate || '2024-01-01',
        status: 'ACTIVE',
      };

      setCompensations((prev) => [newRecord, ...prev]);
      setSaving(false);
      setDrawerOpen(false);
      setBasicPay('');
      setAllowances('');
      setDeductions('');
      setEffectiveDate('');
    }, 300);
  };

  const columns = [
    { key: 'scale', label: 'Pay Scale', sortable: true },
    {
      key: 'basicPay',
      label: 'Basic Salary',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{formatCurrency(val)}</span>,
    },
    {
      key: 'allowances',
      label: 'Allowances',
      render: (val) => <span className="text-emerald-600 font-medium">+{formatCurrency(val)}</span>,
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (val) => <span className="text-rose-600 font-medium">-{formatCurrency(val)}</span>,
    },
    {
      key: 'netPay',
      label: 'Net Pay',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
          {formatCurrency(val)}
        </span>
      ),
    },
    { key: 'effectiveDate', label: 'Effective Date', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
          {val}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Compensation & Salary Records
            </h1>
            <Badge variant="primary">Form 9 • Multi-Record</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Payroll revisions, basic pay scales, and verified allowance breakdowns.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={compensations}
        searchPlaceholder="Search salary or scale..."
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
            Add Pay Record
          </Button>
        }
      />

      <SlideOverDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Compensation Scale Record"
        description="Record revised basic pay, allowances, and statutory deductions."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleAddCompensation}>
              Save Pay Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCompensation} className="space-y-4">
          <NumberInput
            label="Basic Monthly Salary (PKR)"
            placeholder="e.g. 130000"
            currency="PKR"
            value={basicPay}
            onChange={(e) => setBasicPay(e.target.value)}
            required
          />
          <NumberInput
            label="Monthly Allowances Total (PKR)"
            placeholder="e.g. 35000"
            currency="PKR"
            value={allowances}
            onChange={(e) => setAllowances(e.target.value)}
          />
          <NumberInput
            label="Monthly Deductions (Tax / GPF / Insurance)"
            placeholder="e.g. 8500"
            currency="PKR"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
          />
          <DateInput
            label="Effective From Date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
          />
        </form>
      </SlideOverDrawer>
    </div>
  );
}
