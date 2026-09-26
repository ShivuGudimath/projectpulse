function ReportsPage({ user }: { user: { role: string } }) {
  const handleDownloadCSV = async () => {
    const token = localStorage.getItem('projectpulse_token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/reports?type=csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const csv = await response.text();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projectpulse-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Reports</div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Generate project reports</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Project progress report', type: 'Progress' },
          { title: 'Financial report', type: 'Financial' },
          { title: 'Delayed project report', type: 'Delay' },
        ].map((report) => (
          <div key={report.title} className="card p-6">
            <div className="text-lg font-bold text-slate-900">{report.title}</div>
            <div className="mt-3 text-sm text-slate-500">Type: {report.type}</div>
            <button onClick={handleDownloadCSV} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Export CSV</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;
