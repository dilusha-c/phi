import { DENGUE_SOURCE_PLACE_TYPES } from '../../constants/patientConstants';

const PatientFilters = ({ filters, onChange, onSearch, onClear, isLoading }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft backdrop-blur">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
          <input
            type="text"
            value={filters.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Search by first or last name"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Dengue Source Place Type</span>
          <select
            value={filters.dengueSourcePlaceType}
            onChange={(event) => onChange('dengueSourcePlaceType', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
          >
            <option value="">All source place types</option>
            {DENGUE_SOURCE_PLACE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Rows per page</span>
          <select
            value={filters.limit}
            onChange={(event) => onChange('limit', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading}
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Search Patients
        </button>
      </div>
    </div>
  );
};

export default PatientFilters;
