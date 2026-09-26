import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Project } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function ProjectDetailPage({ user }: { user: { role: string } }) {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    fetch(`${API_BASE}/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => setProject(data))
      .catch((error) => console.error(error));
  }, [id]);

  if (!project) {
    return <div className="card p-6">Loading project details…</div>;
  }

  const budgetUsed = Math.min(100, Math.round((project.expenditure / Math.max(project.budget, 1)) * 100));

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{project.projectCode}</div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{project.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${project.status === 'Completed' ? 'status-green' : project.status === 'Delayed' ? 'status-red' : 'status-blue'}`}>{project.status}</span>
            <span className={`badge ${project.risk?.level === 'Critical' ? 'status-red' : project.risk?.level === 'High' ? 'status-yellow' : 'status-blue'}`}>Risk: {project.risk?.level || 'Low'}</span>
          </div>
        </div>

        <p className="mt-4 text-slate-600">{project.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Project Health</div>
          <div className="mt-3 space-y-4">
            {[
              { label: 'Progress', value: project.progress },
              { label: 'Budget', value: budgetUsed },
              { label: 'Timeline', value: 78 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200">
                  <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk Prediction</div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900">Project Risk: {project.risk?.level || 'Low'}</div>
          <div className="mt-3 text-sm text-slate-600">Completion: {project.progress}% · Expected completion: {project.risk?.daysRemaining || 0} days · Current delay: {project.risk?.delayDays || 0} days</div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
            {(project.risk?.reasons || ['Project is tracking within normal limits']).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-900">Overview</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Department</div><div className="mt-1 font-semibold">{project.department}</div></div>
            <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Category</div><div className="mt-1 font-semibold">{project.category}</div></div>
            <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">District</div><div className="mt-1 font-semibold">{project.district}</div></div>
            <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">State</div><div className="mt-1 font-semibold">{project.state}</div></div>
            <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Start Date</div><div className="mt-1 font-semibold">{new Date(project.startDate).toLocaleDateString()}</div></div>
            <div><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Expected End</div><div className="mt-1 font-semibold">{new Date(project.expectedEndDate).toLocaleDateString()}</div></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-900">Financials</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Approved budget</span><span className="font-semibold">₹{project.budget.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Amount spent</span><span className="font-semibold">₹{project.expenditure.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Remaining</span><span className="font-semibold">₹{(project.budget - project.expenditure).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Utilization</span><span className="font-semibold">{budgetUsed}%</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-900">Milestones</h3>
          <div className="mt-5 space-y-4">
            {project.milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-800">{milestone.name}</div>
                  <span className="badge status-blue">{milestone.status}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{milestone.description}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{milestone.completion}% complete</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-bold text-slate-900">Issues</h3>
          <div className="mt-5 space-y-4">
            {project.issues.map((issue) => (
              <div key={issue.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-slate-800">{issue.title}</div>
                  <span className={`badge ${issue.priority === 'Critical' ? 'status-red' : issue.priority === 'High' ? 'status-yellow' : 'status-blue'}`}>{issue.priority}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{issue.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
