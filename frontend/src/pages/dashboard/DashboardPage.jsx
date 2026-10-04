import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@/components/common';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.credentials?.role || 'EMPLOYEE';
  const subCategory = user?.credentials?.subCategory;
  const assignedNumber = user?.credentials?.assignedNumber || 'N/A';
  const email = user?.credentials?.email || 'No email registered';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm">
            Active System Session
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {role} {assignedNumber}
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Welcome to the Employee Management System. Access and manage your employee profile, financial ledger, and family dossier using the modules below.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-sky-200">Role:</span>
            <span className="font-bold">{role}</span>
          </div>
          {subCategory && (
            <div className="flex justify-between gap-4">
              <span className="text-sky-200">Sub-Category:</span>
              <span className="font-bold">{subCategory}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-sky-200">Assigned Code:</span>
            <span className="font-bold">{assignedNumber}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sky-200">Email:</span>
            <span className="font-bold">{email}</span>
          </div>
        </div>
      </div>

      {/* Modules Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee Profile */}
        <Card className="hover:border-sky-300 transition-all hover:shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="primary">Employee Dossier</Badge>
              <span className="text-xs text-slate-400 font-mono">Module 01</span>
            </div>
            <CardTitle className="mt-2 text-slate-900">Employee Profile</CardTitle>
            <CardDescription>
              Personal bio, identity verification, dual residential addresses, contact points, and languages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Includes Basic Bio, CNIC & NADRA identity, Present & Permanent addresses, contact channels, and language proficiencies.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/employee/personal')}
              className="w-full text-xs font-semibold"
            >
              Open Employee Profile →
            </Button>
          </CardContent>
        </Card>

        {/* Finance Ledger */}
        <Card className="hover:border-emerald-300 transition-all hover:shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="success">Income & Expenses</Badge>
              <span className="text-xs text-slate-400 font-mono">Module 02</span>
            </div>
            <CardTitle className="mt-2 text-slate-900">Finance Ledger</CardTitle>
            <CardDescription>
              Stand-alone income tracking and distributed domestic living expenses with live balance analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Track standalone incomes, home utility bills, and miscellaneous expenses with automatic financial balance computation.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/finance/income')}
              className="w-full text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              Open Finance Ledger →
            </Button>
          </CardContent>
        </Card>

        {/* Family Dossier */}
        <Card className="hover:border-sky-300 transition-all hover:shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="info">Family Dossier</Badge>
              <span className="text-xs text-slate-400 font-mono">Module 03</span>
            </div>
            <CardTitle className="mt-2 text-slate-900">Family Dossier</CardTitle>
            <CardDescription>
              Comprehensive family registry managing spouse, dependent children, and parent records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Features in-page dossier management for spouses, children, and parents with dedicated addresses.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/family/spouses')}
              className="w-full text-xs font-semibold text-sky-700 border-sky-300 hover:bg-sky-50"
            >
              Open Family Dossier →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
