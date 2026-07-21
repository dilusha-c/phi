const statusStyles = {
  Active: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Inactive: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status] || statusStyles.Inactive}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
