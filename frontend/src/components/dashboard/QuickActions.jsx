import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const actions = [
  { label: 'Register New Patient', to: '/patients/register' },
  { label: 'Generate Reports', to: '/reports/activity' },
  { label: 'Inspect GIS Case Map', to: '/map' },
  { label: 'Log Daily Activity', to: '/activities/new' },
];

const QuickActions = () => {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Management Tasks</h3>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:bg-primary-950/20 dark:hover:text-primary-200"
          >
            <span>{action.label}</span>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
