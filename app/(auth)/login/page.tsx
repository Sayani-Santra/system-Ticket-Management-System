
'use client';

import { useState, useTransition } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await login(formData);

      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 text-slate-800">

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">

        <div className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-100/50 border border-blue-100">

          <div className="grid lg:grid-cols-2 min-h-[680px]">

            {/* ================= LEFT SIDE ================= */}
            <section className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-500 p-12 text-white">

              {/* Decorative circles */}
              <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

              <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-pink-300/25 blur-3xl" />

              {/* Decorative shapes */}
              <div className="absolute top-32 right-20 text-6xl text-white/10 rotate-12">
                ♡
              </div>

              <div className="absolute bottom-40 left-16 text-4xl text-white/10">
                ✦
              </div>

              <div className="relative z-10 flex flex-col justify-between w-full">

                {/* Logo */}
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 text-xl font-black shadow-lg">
                    S
                  </div>

                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      SupportDesk
                    </h1>

                    <p className="text-xs text-blue-100">
                      Smart Ticket Management
                    </p>
                  </div>

                </div>

                {/* Main Content */}
                <div className="my-auto max-w-md">

                  {/* Status */}
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-medium backdrop-blur-md">

                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />

                    Everything under control

                  </div>

                  {/* Heading */}
                  <h2 className="text-4xl font-extrabold leading-tight tracking-tight">

                    Make support

                    <span className="block text-blue-100">
                      simple & connected.
                    </span>

                  </h2>

                  {/* Description */}
                  <p className="mt-5 text-sm leading-7 text-blue-100">

                    Manage tickets, assign tasks, track progress and keep
                    your support team connected — all from one beautiful
                    workspace.

                  </p>

                  {/* Info Card */}
                  <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-xl">

                    <div className="flex items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                        💙
                      </div>

                      <div>

                        <p className="font-semibold">
                          Your support, organized.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-100">
                          Keep track of tickets, assignments and updates
                          without unnecessary complexity.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-blue-100">

                  <span>
                    © {new Date().getFullYear()} SupportDesk
                  </span>

                  <span className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-emerald-300" />

                    System operational

                  </span>

                </div>

              </div>

            </section>

            {/* ================= RIGHT SIDE ================= */}
            <section className="relative flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-14">

              {/* Decorative elements */}
              <div className="pointer-events-none absolute right-8 top-8 text-4xl text-pink-100">
                ♡
              </div>

              <div className="pointer-events-none absolute bottom-8 left-8 text-3xl text-blue-100">
                ✦
              </div>

              <div className="w-full max-w-md">

                {/* Mobile Logo */}
                <div className="mb-10 flex items-center gap-3 lg:hidden">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-pink-500 text-white text-lg font-black shadow-lg shadow-blue-200">
                    S
                  </div>

                  <div>

                    <h1 className="font-bold text-slate-900">
                      SupportDesk
                    </h1>

                    <p className="text-xs text-slate-400">
                      Smart Ticket Management
                    </p>

                  </div>

                </div>

                {/* Heading */}
                <div className="mb-8">

                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-pink-50 px-4 py-2 text-xs font-semibold text-blue-600 border border-blue-100">

                    <span className="text-pink-500">
                      ♡
                    </span>

                    Welcome back

                  </div>

                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">

                    Hello again! 👋

                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">

                    Sign in to continue to your support dashboard.

                  </p>

                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                      !
                    </div>

                    <p className="font-medium">
                      {errorMessage}
                    </p>

                  </div>
                )}

                {/* Form */}
                <form action={handleSubmit} className="space-y-5">

                  {/* Email */}
                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                        ✉
                      </span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="name@company.com"
                        className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/10"
                      />

                    </div>

                  </div>

                  {/* Password */}
                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        className="text-xs font-semibold text-pink-500 hover:text-pink-600"
                      >
                        Forgot password?
                      </button>

                    </div>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">
                        🔒
                      </span>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-400/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-pink-500"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>

                    </div>

                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-200/50 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isPending ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >

                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-30"
                          />

                          <path
                            d="M21 12a9 9 0 00-9-9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                        </svg>

                        Signing you in...
                      </>
                    ) : (
                      <>
                        Sign in to Dashboard

                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}

                  </button>

                </form>

                {/* Security */}
                <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-pink-50/70 px-4 py-3 text-center text-xs text-slate-400">

                  <span>🔐</span>

                  <span>
                    Secured with Appwrite Authentication
                  </span>

                </div>

                {/* Bottom */}
                <p className="mt-6 text-center text-xs text-slate-400">

                  Made with{' '}

                  <span className="text-pink-500">
                    ♥
                  </span>{' '}

                  for authorized support staff

                </p>

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}
