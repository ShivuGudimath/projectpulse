import { useEffect, useState } from 'react';
import type { FeedbackItem } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function FeedbackPage({ user }: { user: { role: string } }) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectId: 'p-101',
    category: 'Delay',
    description: '',
    location: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    fetch(`${API_BASE}/feedback`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => setFeedback(data))
      .catch((error) => console.error(error));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('projectpulse_token');
    const response = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const data = await response.json();
      setFeedback((prev) => [data, ...prev]);
      setForm({ name: '', email: '', projectId: 'p-101', category: 'Delay', description: '', location: '' });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Citizen feedback</div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Submit a report</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} placeholder="Project ID" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <option>Delay</option>
              <option>Safety</option>
              <option>Work quality</option>
              <option>Corruption concern</option>
              <option>Environmental concern</option>
              <option>Other</option>
            </select>
          </div>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Describe your concern or feedback" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3" />
          <button type="submit" className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Submit report</button>
        </form>
      </div>

      <div className="card p-6">
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Latest reports</div>
        <div className="mt-5 space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-slate-800">{item.name}</div>
                <span className="badge status-yellow">{item.status}</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">{item.category} · {item.location}</div>
              <div className="mt-2 text-sm text-slate-700">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
