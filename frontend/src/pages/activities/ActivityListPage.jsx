import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Search, MapPin, Eye, X, ClipboardCheck, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';
import { activityService } from '../../services/activityService';
import { authService } from '../../services/authService';
import { configureLeafletIcons } from '../../components/map/leafletSetup';
import { AuthContext } from '../../context/AuthContext';

configureLeafletIcons();

const MiniActivityMap = ({ coordinates }) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  // Backend stores coordinates as [longitude, latitude]. Leaflet expects [latitude, longitude]
  const center = [coordinates[1], coordinates[0]];
  return (
    <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 mt-2 relative">
      <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="h-full w-full" style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
};

const defaultFilters = {
  phiId: '',
  phiName: '',
  date: '',
  startDate: '',
  endDate: '',
  limit: '10',
};

const defaultPagination = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  totalPages: 1,
};

const ActivityListPage = () => {
  const { pushNotification } = useNotification();
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [phiSuggestions, setPhiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async (val) => {
    if (!val || val.trim().length === 0) {
      setPhiSuggestions([]);
      return;
    }
    try {
      const res = await authService.getPhis(val);
      if (res.success) {
        setPhiSuggestions(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'PHI' && user.phiId) {
      setDraftFilters((current) => ({ ...current, phiId: user.phiId }));
      setAppliedFilters((current) => ({ ...current, phiId: user.phiId }));
    }
  }, [user]);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState(defaultPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await activityService.getActivities({
        phiId: appliedFilters.phiId,
        phiName: appliedFilters.phiName,
        date: appliedFilters.date,
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        limit: appliedFilters.limit,
        page: currentPage,
      });

      setLogs(response.data || []);
      setPagination({
        page: response.meta?.page || currentPage,
        limit: response.meta?.limit || Number(appliedFilters.limit),
        totalRecords: response.meta?.totalRecords || 0,
        totalPages: response.meta?.totalPages || 1,
      });
    } catch (error) {
      pushNotification({
        type: 'error',
        title: 'Error loading activities',
        message: error.message || 'Unable to retrieve daily activity logs.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, currentPage, refreshTick]);

  const handleFilterChange = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedFilters(draftFilters);
  };

  const handleClear = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
  };

  const goToPage = (nextPage) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), pagination.totalPages);
    setCurrentPage(boundedPage);
  };

  return (
    <div className="space-y-6">
      {/* Title Header Card */}
      <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-300">Daily Activities</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">PHI Daily Activity Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track and query daily operations reported by Public Health Inspectors (PHIs) in their respective areas.
            </p>
          </div>
          <Link
            to="/activities/new"
            className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-soft"
          >
            Log Daily Activity
          </Link>
        </div>
      </section>

      {/* Filter Section */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <Search className="h-4 w-4 text-primary-600 dark:text-primary-300" />
          Filter Activity Logs
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(user?.role === 'SPHI' || user?.role === 'Admin') && (
            <label className="block relative">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Search by PHI Name</span>
              <input
                type="text"
                value={draftFilters.phiName}
                onChange={(e) => {
                  handleFilterChange('phiName', e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search by inspector name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-primary-400 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
              {showSuggestions && phiSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  {phiSuggestions.map((phi) => (
                    <button
                      key={phi._id || phi.phiId}
                      type="button"
                      onClick={() => {
                        handleFilterChange('phiName', phi.name);
                        setPhiSuggestions([]);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 block border-b last:border-0 border-slate-100 dark:border-slate-800"
                    >
                      <div className="font-semibold">{phi.name}</div>
                      <div className="text-[10px] text-slate-400">{phi.phiId}</div>
                    </button>
                  ))}
                </div>
              )}
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Single Date</span>
            <input
              type="date"
              value={draftFilters.date}
              disabled={Boolean(draftFilters.startDate || draftFilters.endDate)}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-primary-400 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Date</span>
            <input
              type="date"
              value={draftFilters.startDate}
              disabled={Boolean(draftFilters.date)}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-primary-400 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">End Date</span>
            <input
              type="date"
              value={draftFilters.endDate}
              disabled={Boolean(draftFilters.date)}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-primary-400 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </div>
      </section>

      {/* List / Table Section */}
      <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Logs</h3>
            <p className="text-sm text-slate-500">
              {pagination.totalRecords} total records · Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
          <div className="rounded-2xl bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:bg-primary-950/40 dark:text-primary-200">
            Showing {logs.length} records
          </div>
        </div>

        <div>
          {loading ? (
            <LoadingSpinner label="Loading daily activity logs..." />
          ) : logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No activity logs found. Log a new activity to get started.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/70">
                    <tr>
                      {(user?.role === 'PHI'
                        ? ['Log ID', 'Date', 'Activities Count', 'Actions']
                        : ['Log ID', 'PHI Name', 'Date', 'Activities Count', 'Actions']
                      ).map((header) => (
                        <th key={header} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{log.activityLogId}</td>
                        {(user?.role === 'SPHI' || user?.role === 'Admin') && (
                          <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                            <div className="font-semibold text-slate-900 dark:text-white">{log.phiName || 'Unknown PHI'}</div>
                          </td>
                        )}
                        <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{log.activities?.length || 0}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <Link
                              to={`/activities/${log._id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/50 dark:bg-primary-950/20 dark:text-primary-300"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && !loading ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Details Side-Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedLog(null)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-lg">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                  <div className="bg-slate-900 p-6 text-white dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold flex items-center gap-2" id="slide-over-title">
                        <ClipboardCheck className="h-5 w-5 text-primary-400" />
                        Log Details
                      </h2>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/activities/${selectedLog._id}/edit`}
                          className="rounded-lg bg-primary-600 text-white px-3 py-1.5 text-xs font-bold transition hover:bg-primary-700"
                        >
                          Edit Log
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedLog(null)}
                          className="rounded-lg text-slate-400 hover:text-white p-1 hover:bg-slate-800/80 transition"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Log Identifier</p>
                      <p className="text-xl font-bold">{selectedLog.activityLogId}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 p-6">
                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">PHI Submitter</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{selectedLog.phiName || 'Unknown PHI'}</p>
                        <p className="text-[11px] text-slate-500 font-semibold">{selectedLog.phiId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Date Mapped</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                          {new Date(selectedLog.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selectedLog.notes && (
                      <div className="rounded-2xl bg-amber-50/65 border border-amber-100/60 p-4 dark:bg-amber-950/20 dark:border-amber-900/50">
                        <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold">Notes / Remarks</p>
                        <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{selectedLog.notes}</p>
                      </div>
                    )}

                    {/* Activities array */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        Activities Performed ({selectedLog.activities?.length || 0})
                      </h4>
                      {selectedLog.activities && selectedLog.activities.map((act, idx) => (
                        <div key={act._id || idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">Activity #{idx + 1}</span>
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                              {act.activityType}
                            </span>
                          </div>
                          
                          {act.activityType === 'Other' && (
                            <div className="text-sm bg-slate-50 px-3 py-2 rounded-xl dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                              <span className="text-xs text-slate-400 block uppercase tracking-wider font-medium">Custom Description</span>
                              {act.customActivityType}
                            </div>
                          )}

                          {act.activityType === 'Dengue Patients Home Visit' && act.patientName && (
                            <div className="text-sm bg-slate-50 px-3 py-2 rounded-xl dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-300">
                              <span className="text-xs text-slate-400 block uppercase tracking-wider font-medium">Visited Patient</span>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {act.patientName} {act.patient?.patientId ? `(${act.patient.patientId})` : ''}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                            <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Location</p>
                            <p className="text-sm font-semibold">{act.location?.name || 'Not typed (Selected on Map)'}</p>
                          </div>

                          {act.notes && (
                            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                              <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Activity Notes</p>
                              <p className="text-xs leading-relaxed font-medium">{act.notes}</p>
                            </div>
                          )}

                          {/* Map container if geolocated */}
                          {act.location?.coordinates && act.location.coordinates.length === 2 && (
                            <MiniActivityMap coordinates={act.location.coordinates} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;
