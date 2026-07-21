import { Search } from 'lucide-react';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white dark:border-slate-750 dark:bg-slate-900 dark:text-slate-100';

const MapFilters = ({ filters, onChange, onSubmit, onReset }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({
      ...filters,
      [name]: value,
    });
  };

  const handleCheckboxChange = (type) => {
    const nextTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({
      ...filters,
      types: nextTypes,
    });
  };

  const months = [
    { label: 'All Months', value: '' },
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Search Query</span>
          <div className="relative">
            <input name="search" value={filters.search} onChange={handleChange} className={inputClassName} placeholder="Case ID, hospital, PHI ID" />
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </label>
        
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">District</span>
          <input name="district" value={filters.district} onChange={handleChange} className={inputClassName} placeholder="District name" />
        </label>
        
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">MOH Area</span>
          <input name="mohArea" value={filters.mohArea} onChange={handleChange} className={inputClassName} placeholder="MOH area" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 border-t border-slate-100 dark:border-slate-800 pt-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Quick Month Select</span>
          <select
            name="selectedMonth"
            value={filters.selectedMonth}
            onChange={(e) => {
              onChange({
                ...filters,
                selectedMonth: e.target.value,
                from: '',
                to: ''
              });
            }}
            className={inputClassName}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Select Year</span>
          <select
            name="selectedYear"
            value={filters.selectedYear}
            onChange={handleChange}
            className={inputClassName}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Date From</span>
          <input
            type="date"
            name="from"
            value={filters.from}
            disabled={Boolean(filters.selectedMonth)}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Date To</span>
          <input
            type="date"
            name="to"
            value={filters.to}
            disabled={Boolean(filters.selectedMonth)}
            onChange={handleChange}
            className={inputClassName}
          />
        </label>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
        <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Map Marker Toggles</span>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          {[
            { type: 'Patient', label: 'Dengue Patients (Red)', color: 'bg-[#dc2626]' },
            { type: 'Home Visit', label: 'Home Visits (Yellow)', color: 'bg-[#eab308]' },
            { type: 'Field Visit', label: 'Field Visits (Green)', color: 'bg-[#22c55e]' },
            { type: 'Source Check', label: 'Source Checks (Orange)', color: 'bg-[#f97316]' },
            { type: 'Other', label: 'Other Activities (Purple)', color: 'bg-[#a855f7]' }
          ].map(item => (
            <label key={item.type} className="inline-flex items-center gap-2 cursor-pointer hover:opacity-85 transition bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-150 dark:border-slate-750 select-none">
              <input
                type="checkbox"
                checked={filters.types.includes(item.type)}
                onChange={() => handleCheckboxChange(item.type)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4 shrink-0"
              />
              <span className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
        <button type="button" onClick={onReset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          Reset Filters
        </button>
        <button type="submit" className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-soft">
          Apply Map Filters
        </button>
      </div>
    </form>
  );
};

export default MapFilters;