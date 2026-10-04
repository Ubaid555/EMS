import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Select, RadioGroup, Alert, Card, CardContent } from '@/components/common';
import { validateEmail } from '@/utils/validators';

const TEACHER_SUBCATEGORIES = [
  { value: 'MONTESSORI', label: 'Montessori' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'MIDDLE', label: 'Middle' },
  { value: 'HIGH', label: 'High School' },
  { value: 'COLLEGE', label: 'College' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('TEACHER');
  const [subCategory, setSubCategory] = useState('HIGH');
  const [assignedNumber, setAssignedNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client Validation
    const errors = {};
    if (!assignedNumber.trim()) {
      errors.assignedNumber = 'Assigned number is required.';
    }
    if (role === 'TEACHER' && !subCategory) {
      errors.subCategory = 'Sub-category is required for Teacher.';
    }
    if (email && validateEmail(email)) {
      errors.email = validateEmail(email);
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await register({
      role,
      subCategory: role === 'TEACHER' ? subCategory : null,
      assignedNumber: assignedNumber.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(result.error?.message || 'Registration failed. Please try again.');
      if (result.error?.fieldErrors) {
        setFieldErrors(result.error.fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white font-extrabold text-2xl shadow-lg shadow-sky-600/30 mb-4">
          EMS
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Employee Account
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Register your assigned credentials to activate your portal
        </p>
      </div>

      {/* Main Register Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg shadow-slate-200/50 border-slate-200">
          <CardContent className="p-8 space-y-6">
            {errorMessage && (
              <Alert
                type="error"
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <RadioGroup
                label="Select Role"
                name="role"
                value={role}
                onChange={(newRole) => {
                  setRole(newRole);
                  setFieldErrors((prev) => ({ ...prev, subCategory: undefined }));
                }}
                layout="horizontal"
                options={[
                  { value: 'TEACHER', label: 'Teacher' },
                  { value: 'STAFF', label: 'Staff' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
              />

              {/* Conditional SubCategory for Teacher */}
              {role === 'TEACHER' && (
                <Select
                  label="Teaching Level / Sub-Category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  options={TEACHER_SUBCATEGORIES}
                  error={fieldErrors.subCategory}
                  required
                />
              )}

              {/* Assigned Number */}
              <Input
                label="Assigned Number / Employee Code"
                placeholder={role === 'ADMIN' ? 'e.g. ADM-001 or 1001' : 'e.g. 1001 or EMP-042'}
                value={assignedNumber}
                onChange={(e) => setAssignedNumber(e.target.value)}
                error={fieldErrors.assignedNumber}
                required
                helperText="Unique identifier assigned to you."
              />

              {/* Email Address */}
              <Input
                label="Email Address (Optional)"
                placeholder="name@institution.edu.pk"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                autoComplete="email"
              />

              {/* Password */}
              <Input
                label="Password (min 8 characters)"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                required
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                }
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={fieldErrors.confirmPassword}
                required
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full text-base py-3"
                >
                  Create Account
                </Button>
              </div>
            </form>

            {/* Bottom link to Login */}
            <div className="mt-6 text-center border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                >
                  Sign in to your account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
