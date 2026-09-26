import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function ProjectsPage({ user }: { user: { role: string } }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    fetch(`${API_BASE}/projects?search=${encodeURIComponent(search)}&status=${status === 'all' ? '' : status}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error(error));
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Portfolio</div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Projects</h1>
        </div>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, district, department"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="all">All statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{project.projectCode}</div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{project.name}</h3>
              </div>
              <span className={`badge ${project.status === 'Completed' ? 'status-green' : project.status === 'Delayed' ? 'status-red' : project.status === 'On Hold' ? 'status-yellow' : 'status-blue'}`}>
                {project.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600">{project.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</div>
                <div className="mt-1 font-semibold text-slate-700">{project.district}, {project.state}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget</div>
                <div className="mt-1 font-semibold text-slate-700">₹{(project.budget / 100000).toFixed(2)} L</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</div>
                <div className="mt-1 font-semibold text-slate-700">{project.progress}%</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk</div>
                <div className="mt-1 font-semibold text-slate-700">{project.risk?.level || 'Low'}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;
