const legendItems = [
  { label: 'Dengue Patient Case', color: '#dc2626' },
  { label: 'PHI Home Visit', color: '#eab308' },
  { label: 'PHI Field Visit', color: '#22c55e' },
  { label: 'PHI Source Check', color: '#f97316' },
  { label: 'Other PHI Activity', color: '#a855f7' }
];

const MarkerLegend = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Marker Legend</h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarkerLegend;