import { useEffect, useState, useContext } from 'react';
import { FileText, Download, Search, Calendar, User, FileBarChart, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';
import { activityService } from '../../services/activityService';
import { authService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-primary-400 dark:border-slate-800 dark:bg-slate-800 dark:text-white';

// Helper to dynamically load jsPDF and jsPDF-AutoTable from CDN
const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      const autotableScript = document.createElement('script');
      autotableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js';
      autotableScript.onload = () => resolve(window.jspdf);
      autotableScript.onerror = (e) => reject(e);
      document.body.appendChild(autotableScript);
    };
    script.onerror = (e) => reject(e);
    document.body.appendChild(script);
  });
};

const ActivityReportPage = () => {
  const { pushNotification } = useNotification();
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Filters State
  const [phiId, setPhiId] = useState('');
  const [phiName, setPhiName] = useState('');
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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [appliedFilters, setAppliedFilters] = useState({
    phiId: '',
    phiName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (user?.role === 'PHI' && user.phiId) {
      setPhiId(user.phiId);
      setAppliedFilters((current) => ({ ...current, phiId: user.phiId, phiName: '' }));
    }
  }, [user]);

  // Available Years for Month Picker
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

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

  // Handle month shortcut select
  const handleMonthChange = (monthVal) => {
    setSelectedMonth(monthVal);
    if (!monthVal) {
      setStartDate('');
      setEndDate('');
      return;
    }
    const firstDay = `${selectedYear}-${monthVal}-01`;
    // Find last day of month
    const yearNum = parseInt(selectedYear);
    const monthNum = parseInt(monthVal);
    const lastDayNum = new Date(yearNum, monthNum, 0).getDate();
    const lastDay = `${selectedYear}-${monthVal}-${lastDayNum.toString().padStart(2, '0')}`;
    
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handleYearChange = (yearVal) => {
    setSelectedYear(yearVal);
    if (selectedMonth) {
      const firstDay = `${yearVal}-${selectedMonth}-01`;
      const yearNum = parseInt(yearVal);
      const monthNum = parseInt(selectedMonth);
      const lastDayNum = new Date(yearNum, monthNum, 0).getDate();
      const lastDay = `${yearVal}-${selectedMonth}-${lastDayNum.toString().padStart(2, '0')}`;
      
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      phiId: phiId.trim(),
      phiName: phiName.trim(),
      startDate,
      endDate
    });
  };

  const handleClearFilters = () => {
    setPhiId('');
    setPhiName('');
    setStartDate('');
    setEndDate('');
    setSelectedMonth('');
    setAppliedFilters({
      phiId: '',
      phiName: '',
      startDate: '',
      endDate: ''
    });
  };

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Fetch up to 200 logs for reporting
        const response = await activityService.getActivities({
          phiId: appliedFilters.phiId,
          phiName: appliedFilters.phiName,
          startDate: appliedFilters.startDate,
          endDate: appliedFilters.endDate,
          limit: 200
        });

        // Flatten logs into individual activities
        const list = response.data || [];
        const flattened = [];
        list.forEach(log => {
          if (log.activities && Array.isArray(log.activities)) {
            log.activities.forEach(act => {
              flattened.push({
                logId: log.activityLogId,
                mongoId: log._id,
                phiId: log.phiId,
                phiName: log.phiName,
                date: log.date,
                type: act.activityType,
                customActivityType: act.customActivityType,
                patientName: act.patientName,
                patientId: act.patient?.patientId,
                location: act.location?.name || 'Map Pin Selected',
                notes: act.notes || '-'
              });
            });
          }
        });

        setActivities(flattened);
      } catch (err) {
        pushNotification({
          type: 'error',
          title: 'Report Fetch Failed',
          message: err.message || 'Unable to retrieve activities for report.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [appliedFilters, pushNotification]);

  // Compute metrics
  const totalActivitiesCount = activities.length;
  const homeVisitsCount = activities.filter(a => a.type === 'Dengue Patients Home Visit').length;
  const fieldVisitsCount = activities.filter(a => a.type === 'Field Visit').length;
  const sourceChecksCount = activities.filter(a => a.type === 'Source Check').length;
  const otherCount = activities.filter(a => a.type === 'Other').length;

  const handleDownloadPDF = async () => {
    if (activities.length === 0) {
      pushNotification({
        type: 'warning',
        title: 'Empty Report',
        message: 'No activity data available to download.'
      });
      return;
    }

    setPdfGenerating(true);
    try {
      const jspdfModule = await loadJsPDF();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF('p', 'mm', 'a4');

      // Title & Header Design
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(0, 0, 210, 40, 'F');

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('DENGUE SURVEILLANCE & PHI SYSTEM', 14, 18);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text('Public Health Inspector Daily Activity Report', 14, 28);

      // Metadata Info Box
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

      // Date range format: DD/MM/YYYY to DD/MM/YYYY
      const formatDate = (dStr) => {
        if (!dStr) return '';
        const d = new Date(dStr);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      };

      const startStr = formatDate(appliedFilters.startDate) || 'Start';
      const endStr = formatDate(appliedFilters.endDate) || 'End';
      const rangeText = `Date Range: ${startStr} to ${endStr}`;
      doc.text(rangeText, 14, 54);

      let summaryY = 60;
      let tableStartY = 84;

      if (user?.role === 'PHI') {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        const phiNameText = `PHI Name: ${user.name}`;
        const textWidth = doc.getTextWidth(phiNameText);
        const xPos = (210 - textWidth) / 2;
        doc.text(phiNameText, xPos, 63);

        summaryY = 70;
        tableStartY = 94;
      }

      // Summary Count Badges
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(14, summaryY, 182, 18, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(14, summaryY, 182, 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('REPORT SUMMARY:', 18, summaryY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const summaryMetrics = `Total Logs: ${totalActivitiesCount}  |  Home Visits: ${homeVisitsCount}  |  Field Visits: ${fieldVisitsCount}  |  Source Checks: ${sourceChecksCount}  |  Others: ${otherCount}`;
      doc.text(summaryMetrics, 18, summaryY + 12);

      // Format table body data and headers dynamically
      let headCols, tableRows, columnStyles;

      if (user?.role === 'PHI') {
        headCols = [['Date', 'Activity Type', 'Location Target', 'Patient (If Visit)', 'Notes / Remarks']];
        tableRows = activities.map(act => {
          const dateStr = new Date(act.date).toLocaleDateString();
          const typeStr = act.type === 'Other' ? `Other (${act.customActivityType || '-'})` : act.type;
          const patientStr = act.patientName ? `${act.patientName} ${act.patientId ? `(${act.patientId})` : ''}` : '-';
          return [
            dateStr,
            typeStr,
            act.location,
            patientStr,
            act.notes
          ];
        });
        columnStyles = {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 42 },
          3: { cellWidth: 42 },
          4: { cellWidth: 42 }
        };
      } else {
        headCols = [['Date', 'PHI Name', 'Activity Type', 'Location Target', 'Patient (If Visit)', 'Notes / Remarks']];
        tableRows = activities.map(act => {
          const dateStr = new Date(act.date).toLocaleDateString();
          const typeStr = act.type === 'Other' ? `Other (${act.customActivityType || '-'})` : act.type;
          const patientStr = act.patientName ? `${act.patientName} ${act.patientId ? `(${act.patientId})` : ''}` : '-';
          return [
            dateStr,
            act.phiName || 'Unknown PHI',
            typeStr,
            act.location,
            patientStr,
            act.notes
          ];
        });
        columnStyles = {
          0: { cellWidth: 18 },
          1: { cellWidth: 32 },
          2: { cellWidth: 26 },
          3: { cellWidth: 34 },
          4: { cellWidth: 36 },
          5: { cellWidth: 36 }
        };
      }

      // AutoTable Plugin Execution
      doc.autoTable({
        startY: tableStartY,
        head: headCols,
        body: tableRows,
        headStyles: { fillColor: [59, 130, 246] }, // primary-500
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 7.5, cellPadding: 2 },
        columnStyles: columnStyles
      });

      doc.save(`Activity_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      pushNotification({
        type: 'success',
        title: 'PDF Downloaded',
        message: 'Your activity report PDF was successfully saved.'
      });
    } catch (err) {
      console.error(err);
      pushNotification({
        type: 'error',
        title: 'PDF Generation Failed',
        message: 'Could not render activity report PDF.'
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-300">Surveillance Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Activity Report Dashboard</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Generate, filter, and export Public Health Inspector logs as print-ready PDF summaries.</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={loading || pdfGenerating}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 shadow-soft disabled:cursor-not-allowed disabled:opacity-75"
        >
          {pdfGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF Report
            </>
          )}
        </button>
      </div>

      {/* Filter Section */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-4 w-4 text-primary-600" />
          Filter Specifications
        </h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* PHI Name (SPHI / Admin only) */}
          {(user?.role === 'SPHI' || user?.role === 'Admin') && (
            <label className="block relative">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Search by PHI Name</span>
              <div className="relative">
                <input
                  type="text"
                  value={phiName}
                  onChange={(e) => {
                    setPhiName(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search by name..."
                  className={inputClassName}
                />
                <User className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              {showSuggestions && phiSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  {phiSuggestions.map((phi) => (
                    <button
                      key={phi._id || phi.phiId}
                      type="button"
                      onClick={() => {
                        setPhiName(phi.name);
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

          {/* Month Picker Shortcut */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Month Pick</span>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={inputClassName}
            >
              <option value="">Choose Month</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          {/* Month Picker Year Shortcut */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Picker Year</span>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className={inputClassName}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          {/* Start Date */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</span>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedMonth(''); // Reset month selector if they edit date manually
                }}
                className={inputClassName}
              />
            </div>
          </label>

          {/* End Date */}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</span>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedMonth(''); // Reset month selector if they edit date manually
                }}
                className={inputClassName}
              />
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={handleClearFilters}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Metrics Summary Widgets */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Activities</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{totalActivitiesCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-500">Home Visits</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{homeVisitsCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Field Visits</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{fieldVisitsCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Source Checks</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{sourceChecksCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Other Types</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{otherCount}</p>
        </div>
      </div>

      {/* Activities Grid / Table */}
      <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <FileBarChart className="h-5 w-5 text-primary-600" />
          Detailed Activity Listing
        </h3>

        {loading ? (
          <LoadingSpinner label="Compiling report data..." />
        ) : activities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No activities matched your selected filters. Please adjust date range or PHI submitter.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {(user?.role === 'PHI'
                      ? ['Date', 'Activity Type', 'Location', 'Patient / Target', 'Notes / Remarks']
                      : ['Date', 'PHI Name', 'Activity Type', 'Location', 'Patient / Target', 'Notes / Remarks']
                    ).map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs">
                  {activities.map((act, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {new Date(act.date).toLocaleDateString()}
                      </td>
                      {(user?.role === 'SPHI' || user?.role === 'Admin') && (
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {act.phiName || 'Unknown PHI'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {act.type === 'Other' ? (
                          <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400">
                            Other: {act.customActivityType || 'N/A'}
                          </span>
                        ) : act.type === 'Dengue Patients Home Visit' ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                            Home Visit
                          </span>
                        ) : act.type === 'Field Visit' ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                            Field Visit
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                            Source Check
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px] font-semibold">{act.location}</td>
                      <td className="px-4 py-3">
                        {act.patientName ? (
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {act.patientName}
                            {act.patientId && <span className="text-[10px] text-slate-400 block font-normal">{act.patientId}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={act.notes}>{act.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityReportPage;
