const DashboardCard = ({ title, value, icon: Icon, change, tone = 'primary' }) => {
  const toneStyles = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200',
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          {change ? <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{change}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardCard;
