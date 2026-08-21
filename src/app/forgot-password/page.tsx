'use client';

import { useState } from 'react';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/30 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-border-light">
          {/* Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-purple-500 text-white shadow-md mb-4">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
            <p className="text-sm text-muted mt-1 text-center">
              Enter your email and we&apos;ll send you a link to reset your password
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-success-light flex items-center justify-center">
                <Mail className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm text-muted">
                If an account with <span className="font-semibold text-foreground">{email}</span> exists, you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-light" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Send Reset Link
              </button>

              {/* Back to login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
