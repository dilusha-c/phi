import { useEffect, useState } from 'react';
import { MapPin, BarChart3, ShieldAlert, List, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';
import { patientService } from '../../services/patientService';

const selectClassName =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none transition focus:border-primary-400 dark:border-slate-800 dark:bg-slate-800 dark:text-white';

const AreaReportPage = () => {
  const { pushNotification } = useNotification();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Location Filters State
  const [filterProvince, setFilterProvince] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterMoh, setFilterMoh] = useState('');

  // Date Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Dropdown list options built from active database values
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mohAreas, setMohAreas] = useState([]);

  const months = [
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

  useEffect(() => {
    const fetchAreaDetails = async () => {
      setLoading(true);
      try {
        const response = await patientService.getPatients({ limit: 1000 });
        const list = response.data || [];
        setPatients(list);

        // Extract unique locations for filter lists
        const uniqueProvinces = [...new Set(list.map(p => p.province).filter(Boolean))];
        const uniqueDistricts = [...new Set(list.map(p => p.district).filter(Boolean))];
        const uniqueMohs = [...new Set(list.map(p => p.mohArea).filter(Boolean))];

        setProvinces(uniqueProvinces);
        setDistricts(uniqueDistricts);
        setMohAreas(uniqueMohs);
      } catch (err) {
        pushNotification({
          type: 'error',
          title: 'Surveillance Fetch Failed',
          message: err.message || 'Unable to retrieve case locations data.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAreaDetails();
  }, [pushNotification]);

  // Apply filters in memory
  const filteredPatients = patients.filter(p => {
    if (filterProvince && p.province !== filterProvince) return false;
    if (filterDistrict && p.district !== filterDistrict) return false;
    if (filterMoh && p.mohArea !== filterMoh) return false;

    // In-memory Date Bounds Check
    const regDate = p.registrationDate || p.createdAt;
    if (regDate) {
      const pDate = new Date(regDate).toISOString().slice(0, 10);
      
      let fromDate = startDate;
      let toDate = endDate;

      if (selectedMonth) {
        fromDate = `${selectedYear}-${selectedMonth}-01`;
        const lastDayNum = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
        toDate = `${selectedYear}-${selectedMonth}-${lastDayNum.toString().padStart(2, '0')}`;
      }

      if (fromDate && pDate < fromDate) return false;
      if (toDate && pDate > toDate) return false;
    }

    return true;
  });

  // Calculate stats group by MOH Area
  const mohStats = {};
  filteredPatients.forEach(p => {
    const moh = p.mohArea || 'Unknown MOH';
    mohStats[moh] = (mohStats[moh] || 0) + 1;
  });
  const mohList = Object.entries(mohStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate stats group by District
  const districtStats = {};
  filteredPatients.forEach(p => {
    const dist = p.district || 'Unknown District';
    districtStats[dist] = (districtStats[dist] || 0) + 1;
  });
  const districtList = Object.entries(districtStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate stats group by GN Division
  const gnStats = {};
  filteredPatients.forEach(p => {
    const gn = p.gnDivision || 'Unknown GN';
    gnStats[gn] = (gnStats[gn] || 0) + 1;
  });
  const gnList = Object.entries(gnStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 GN divisions

  // Calculate stats group by Breeding Source Places (dengueSourcePlace)
  const sourceStats = {};
  filteredPatients.forEach(p => {
    const source = p.dengueSourcePlace || 'Unspecified';
    sourceStats[source] = (sourceStats[source] || 0) + 1;
  });
  const sourceList = Object.entries(sourceStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const totalCases = filteredPatients.length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-300">Surveillance Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Case Analysis by Area</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Demographic breakdown and breeding source analysis of active dengue cases.</p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Location Filters</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">Province</span>
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className={selectClassName}
              >
                <option value="">All Provinces</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">District</span>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className={selectClassName}
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">MOH Area</span>
              <select
                value={filterMoh}
                onChange={(e) => setFilterMoh(e.target.value)}
                className={selectClassName}
              >
                <option value="">All MOH Areas</option>
                {mohAreas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Date Filters</h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">Quick Month Select</span>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setStartDate('');
                  setEndDate('');
                }}
                className={selectClassName}
              >
                <option value="">Choose Month</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">Select Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={selectClassName}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">Start Date</span>
              <input
                type="date"
                value={startDate}
                disabled={Boolean(selectedMonth)}
                onChange={(e) => setStartDate(e.target.value)}
                className={selectClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-500">End Date</span>
              <input
                type="date"
                value={endDate}
                disabled={Boolean(selectedMonth)}
                onChange={(e) => setEndDate(e.target.value)}
                className={selectClassName}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={() => {
              setFilterProvince('');
              setFilterDistrict('');
              setFilterMoh('');
              setStartDate('');
              setEndDate('');
              setSelectedMonth('');
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Compiling geographical dashboard..." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: District and MOH Area Breakdown */}
          <div className="space-y-6">
            {/* MOH Area CSS Bar Chart */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <MapPin className="h-5 w-5 text-primary-500" />
                Active Cases by MOH Area
              </h3>

              {mohList.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No MOH area data recorded.</p>
              ) : (
                <div className="space-y-4">
                  {mohList.map((item, idx) => {
                    const percentage = totalCases > 0 ? (item.count / totalCases) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>{item.name}</span>
                          <span>{item.count} cases ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* District Breakdown */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <BarChart3 className="h-5 w-5 text-emerald-500" />
                District Distribution
              </h3>

              {districtList.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No district data recorded.</p>
              ) : (
                <div className="space-y-4">
                  {districtList.map((item, idx) => {
                    const percentage = totalCases > 0 ? (item.count / totalCases) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>{item.name}</span>
                          <span>{item.count} cases</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dengue Source Places and GN Divisions */}
          <div className="space-y-6">
            {/* Dengue Source Places */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Leading Dengue Source Place Types
              </h3>

              {sourceList.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No source place data recorded.</p>
              ) : (
                <div className="space-y-4">
                  {sourceList.map((item, idx) => {
                    const percentage = totalCases > 0 ? (item.count / totalCases) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>{item.name}</span>
                          <span>{item.count} cases</span>
                        </div>
                        <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* GN Division breakdown */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <List className="h-5 w-5 text-indigo-500" />
                Top 10 GN Divisions by Cases
              </h3>

              {gnList.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No GN division data recorded.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-850">
                    <thead className="bg-slate-100/70 dark:bg-slate-800/40 text-left">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">GN Division</th>
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Case Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                      {gnList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                          <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-primary-600 dark:text-primary-400">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaReportPage;
