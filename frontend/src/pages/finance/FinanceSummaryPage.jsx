import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Alert,
} from '@/components/common';
import { formatCurrency } from '@/utils/validators';
import financeService from '@/services/finance.service';
import { parseApiError } from '@/utils/api-error';

export default function FinanceSummaryPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      try {
        const data = await financeService.getSummary();
        setSummary(data);
      } catch (err) {
        const parsed = parseApiError(err);
        setErrorMsg(parsed.message);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const totalIncome = summary?.totals?.totalIncome ?? 0;
  const homeExpenses = summary?.totals?.homeExpenses ?? 0;
  const otherExpenses = summary?.totals?.otherExpenses ?? 0;
  const totalExpense = summary?.totals?.totalExpense ?? homeExpenses + otherExpenses;
  const netSavings = summary?.totals?.netSavings ?? totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Computing Annual Financial Summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Annual Financial Summary & Balance Sheet
            </h1>
            <Badge variant="primary">Analytics • Overview</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated net balance computed automatically from stand-alone incomes and distributed expense categories.
          </p>
        </div>
      </div>

      {errorMsg && (
        <Alert
          type="error"
          title="Summary Unavailable"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Incomes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Incomes
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ▲
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
              {formatCurrency(totalIncome)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Registered Inflows
            </span>
          </div>
        </div>

        {/* Home Expenses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Home Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              🏠
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
              {formatCurrency(homeExpenses)}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
              Domestic Outflows
            </span>
          </div>
        </div>

        {/* Other Expenses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Other Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              ▼
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
              {formatCurrency(otherExpenses)}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
              Miscellaneous Costs
            </span>
          </div>
        </div>

        {/* Net Savings / Balance */}
        <div
          className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3 ${
            netSavings >= 0
              ? 'bg-sky-50/70 border-sky-200'
              : 'bg-rose-50/70 border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Net Financial Balance
            </span>
            <Badge variant={netSavings >= 0 ? 'success' : 'danger'} size="sm">
              {netSavings >= 0 ? 'Surplus' : 'Deficit'}
            </Badge>
          </div>
          <div>
            <span
              className={`text-2xl font-black tracking-tight block ${
                netSavings >= 0 ? 'text-sky-900' : 'text-rose-900'
              }`}
            >
              {formatCurrency(netSavings)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Income minus Cumulative Expenses
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Inflow vs Outflow Ledger Breakdown</CardTitle>
          <CardDescription>
            High-level distribution summary between standalone earnings and distributed family living expenditures.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Expense Ratio vs Income</span>
              <span>
                {totalIncome > 0
                  ? `${Math.min(100, Math.round((totalExpense / totalIncome) * 100))}%`
                  : '0%'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
              <div
                className="bg-amber-500 h-full transition-all"
                style={{
                  width: totalIncome > 0 ? `${(homeExpenses / totalIncome) * 100}%` : '0%',
                }}
                title="Home Expenses"
              />
              <div
                className="bg-rose-500 h-full transition-all"
                style={{
                  width: totalIncome > 0 ? `${(otherExpenses / totalIncome) * 100}%` : '0%',
                }}
                title="Other Expenses"
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Home Expenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Other Expenses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
