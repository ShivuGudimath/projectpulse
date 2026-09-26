import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Project } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function MapPage({ user }: { user: { role: string } }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('projectpulse_token');
    fetch(`${API_BASE}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error(error));
  }, []);

  const markerColor = (status: string) => {
    if (status === 'Completed') return '#10b981';
    if (status === 'Delayed') return '#ef4444';
    if (status === 'On Hold') return '#f59e0b';
    return '#2563eb';
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Map view</div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Project Locations</h1>
      </div>

      <div className="card overflow-hidden p-3">
        <MapContainer center={[22.5, 78.9]} zoom={5} style={{ height: '640px', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {projects.map((project) => (
            <Marker key={project.id} position={[project.latitude, project.longitude]} icon={createCustomIcon(markerColor(project.status))}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-bold">{project.name}</div>
                  <div>{project.location}</div>
                  <div>{project.status}</div>
                  <div>Progress: {project.progress}%</div>
                  <div>Budget: ₹{project.budget.toLocaleString('en-IN')}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function createCustomIcon(color: string) {
  const icon = require('leaflet').Icon;
  return new icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color.replace('#', '')}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export default MapPage;
