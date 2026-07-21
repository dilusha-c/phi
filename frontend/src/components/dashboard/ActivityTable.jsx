const ActivityTable = ({ rows }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/70">
            <tr>
              {['Patient Name', 'Case ID', 'Status', 'Hospital', 'Last Updated'].map((header) => (
                <th key={header} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {rows.map((row) => (
              <tr key={`${row.caseId}-${row.patientName}`} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td className="px-5 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{row.patientName}</td>
                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.caseId}</td>
                <td className="px-5 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.statusClass}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.hospital}</td>
                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{row.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
