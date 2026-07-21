import { FileText } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="rounded-2xl bg-primary-50 p-4 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200">
          <FileText className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
        This is a placeholder page so navigation works. The module content will be added in the next step.
      </div>
    </div>
  );
};

export default PlaceholderPage;
