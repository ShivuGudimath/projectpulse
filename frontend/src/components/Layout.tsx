import { NavLink, Outlet } from 'react-router-dom';
import type { User } from '../types';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Projects', to: '/projects' },
  { label: 'Map', to: '/map' },
  { label: 'Reports', to: '/reports' },
  { label: 'Feedback', to: '/feedback' },
];

function Layout({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-white lg:block">
          <div className="mb-8">
            <div className="text-2xl font-extrabold tracking-tight">ProjectPulse</div>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Monitoring Platform</div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-primary-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-blue-200">Project Health</div>
            <div className="mt-3 text-3xl font-bold text-white">72%</div>
            <div className="mt-2 text-sm text-slate-200">Portfolio completion</div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-primary-600 lg:hidden">P</div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</div>
                  <div className="text-lg font-bold text-slate-900">ProjectPulse</div>
                </div>
              </div>

              <div className="hidden items-center gap-4 md:flex">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Search projects
                </div>
                <div className="relative">
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">🔔</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{user.role}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
                  {user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
