'use client';

import { useState } from 'react';
import Image from 'next/image';
import LogoSharda from '../../../public/logo-sharda.png';
import { Layers, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // According to our script, roles dictate dashboard logic. 
        // For now, redirect to the generic /dashboard which handles role-based sub-routing or allows migration.
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/30 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-border-light">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image src={LogoSharda} alt="Sharda University Logo" width={200} height={64} className="h-16 w-auto mb-4 object-contain" priority />
            <h1 className="text-2xl font-bold text-foreground">SU-RAMS</h1>
            <p className="text-sm text-muted mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-danger bg-danger-light rounded-lg border border-danger/20">
                {error}
              </div>
            )}
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-light" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-light" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-purple-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="#" className="text-primary hover:text-primary-hover font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
