'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChartNoAxesCombined, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { loginAdmin } from '@/lib/auth-api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(email, password);
      localStorage.setItem('admin_token', result.access_token);
      localStorage.setItem('admin_email', result.admin.email);
      router.replace('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 py-8">
      <section className="grid min-h-[620px] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[1fr_1fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500">
              <ChartNoAxesCombined className="h-6 w-6" />
            </div>
            <span className="text-lg font-bold tracking-wide">Miles Assist</span>
          </div>

          <div className="relative max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Admin workspace
            </p>
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Everything you need to run your business.
            </h2>
            <p className="mt-5 leading-7 text-slate-300">
              Sign in to manage users, bookings, transactions, and the latest business insights.
            </p>
          </div>

          <p className="relative text-sm text-slate-400">Secure access for authorized administrators.</p>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-9 lg:hidden">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <ChartNoAxesCombined className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-indigo-600">MILES ASSIST</p>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your administrator credentials to continue.
              </p>
            </div>

            {error && (
              <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword
                      ? <EyeOff aria-hidden="true" className="h-4 w-4" />
                      : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                {!isSubmitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Protected access for Miles Assist administrators.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
