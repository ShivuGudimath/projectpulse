import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { AlertItem, DashboardSummary, Project } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const summaryCards = [
  { label: 'Total Projects', color: 'bg-blue-500', icon: '📊' },
  { label: 'Active Projects', color: 'bg-emerald-500', icon: '🚧' },
  { label: 'Completed', color: 'bg-violet-500', icon: '✅' },
  { label: 'Delayed', color: 'bg-rose-500', icon: '⚠️' },
];

function DashboardPage({ user }: { user: { name: string; role: string } }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    const fetchDashboard = async () => {
      try {
        const [summaryResponse, projectsResponse, alertsResponse] = await Promise.all([
          fetch(`${API_BASE}/analytics/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const summaryData = await summaryResponse.json();
        const projectsData = await projectsResponse.json();
        const alertsData = await alertsResponse.json();

        setSummary(summaryData.summary);
        setProjects(projectsData);
        setAlerts(alertsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  const pieData = [
    { name: 'In Progress', value: summary?.activeProjects || 0 },
    { name: 'Completed', value: summary?.completedProjects || 0 },
    { name: 'Delayed', value: summary?.delayedProjects || 0 },
    { name: 'Planning', value: Math.max(0, (summary?.totalProjects || 0) - (summary?.activeProjects || 0) - (summary?.completedProjects || 0) - (summary?.delayedProjects || 0)) },
  ];

  const budgetData = [
    { name: 'Budget', value: summary?.totalBudget || 0 },
    { name: 'Expenditure', value: summary?.totalExpenditure || 0 },
  ];

  const lineData = [
    { month: 'Jan', progress: 30 },
    { month: 'Feb', progress: 40 },
    { month: 'Mar', progress: 45 },
    { month: 'Apr', progress: 50 },
    { month: 'May', progress: 62 },
    { month: 'Jun', progress: 68 },
    { month: 'Jul', progress: 72 },
  ];

  const topProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Welcome back</div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{user.name}</h1>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          {user.role.toUpperCase()} ACCESS
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => {
          const value = [summary?.totalProjects, summary?.activeProjects, summary?.completedProjects, summary?.delayedProjects][index];
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{card.label}</div>
                  <div className="mt-2 text-3xl font-extrabold text-slate-900">{value ?? 0}</div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${card.color} text-white`}>{card.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Project Status</h3>
            <span className="text-sm text-slate-500">Distribution</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={['#2563eb', '#10b981', '#ef4444', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Budget vs Expenditure</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Monthly Project Progress</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <Area data={lineData} dataKey="progress">
                <XAxis dataKey="month" />
                <YAxis />
              </Area>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Projects Requiring Attention</h3>
          <div className="space-y-4">
            {topProjects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">{project.name}</div>
                    <div className="text-sm text-slate-500">{project.district}</div>
                  </div>
                  <span className={`badge ${project.risk?.level === 'Critical' ? 'status-red' : project.risk?.level === 'High' ? 'status-yellow' : 'status-blue'}`}>
                    {project.risk?.level || 'Low'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Alerts & Notifications</h3>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-800">{alert.title}</div>
                  {!alert.isRead && <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />}
                </div>
                <div className="mt-1 text-sm text-slate-600">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Updates</h3>
          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-800">{project.name}</div>
                  <span className="badge status-green">{project.progress}%</span>
                </div>
                <div className="mt-1 text-sm text-slate-600">{project.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
