import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types';

const demoLoginData = [
  { email: 'admin@projectpulse.demo', password: 'admin123', role: 'Admin' },
  { email: 'officer@projectpulse.demo', password: 'officer123', role: 'Project Officer' },
  { email: 'contractor@projectpulse.demo', password: 'contractor123', role: 'Contractor' },
  { email: 'citizen@projectpulse.demo', password: 'citizen123', role: 'Citizen' },
];

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('admin@projectpulse.demo');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('projectpulse_token', data.token);
      onLogin(data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            Monitor Every Project
          </div>
          <div className="max-w-xl space-y-5">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
              ProjectPulse
            </h1>
            <p className="text-xl text-slate-600">
              A unified digital platform for transparent, data-driven project monitoring across India.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
            {[
              'Centralized monitoring',
              'Real-time progress tracking',
              'Financial transparency',
              'Citizen participation',
            ].map((feature) => (
              <div key={feature} className="card p-4">
                <div className="text-sm font-semibold text-slate-800">{feature}</div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:max-w-xl">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Demo Accounts</div>
            <div className="space-y-2">
              {demoLoginData.map((demo) => (
                <div key={demo.email} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <div className="font-semibold text-slate-700">{demo.role}</div>
                    <div className="text-slate-500">{demo.email}</div>
                  </div>
                  <div className="text-slate-500">{demo.password}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
          <div className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Sign in</div>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Welcome back</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="name@domain.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700">
              Sign in to dashboard
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            New to ProjectPulse? <Link to="#" className="font-semibold text-blue-600">Request access</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
