import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';
import type { User } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem('projectpulse_token'), [location.pathname]);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          localStorage.removeItem('projectpulse_token');
          setUser(null);
          navigate('/login', { replace: true });
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('projectpulse_token');
        setUser(null);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, location.pathname, navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-lg font-semibold text-slate-700">Loading ProjectPulse...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route element={<RequireAuth user={user} />}>
        <Route path="/" element={<DashboardPage user={user!} />} />
        <Route path="/dashboard" element={<DashboardPage user={user!} />} />
        <Route path="/projects" element={<ProjectsPage user={user!} />} />
        <Route path="/projects/:id" element={<ProjectDetailPage user={user!} />} />
        <Route path="/map" element={<MapPage user={user!} />} />
        <Route path="/feedback" element={<FeedbackPage user={user!} />} />
        <Route path="/reports" element={<ReportsPage user={user!} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RequireAuth({ user }: { user: User | null }) {
  const token = localStorage.getItem('projectpulse_token');
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout user={user} />;
}

export default App;
