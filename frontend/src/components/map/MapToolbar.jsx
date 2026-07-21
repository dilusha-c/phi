import { LocateFixed, Layers3, RefreshCcw, Flame, Crosshair } from 'lucide-react';

const MapToolbar = ({ showHeatmap, onToggleHeatmap, onRefresh, onLocate, onResetView }) => {
  const buttonClass =
    'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <button type="button" onClick={onRefresh} className={buttonClass}>
        <RefreshCcw className="h-4 w-4" />
        Refresh
      </button>
      <button type="button" onClick={onLocate} className={buttonClass}>
        <LocateFixed className="h-4 w-4" />
        Locate Me
      </button>
      <button type="button" onClick={onResetView} className={buttonClass}>
        <Crosshair className="h-4 w-4" />
        Reset View
      </button>
      <button
        type="button"
        onClick={onToggleHeatmap}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
          showHeatmap
            ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <Flame className="h-4 w-4" />
        {showHeatmap ? 'Heatmap On' : 'Heatmap Off'}
      </button>
      <div className="ml-auto inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Layers3 className="h-4 w-4" />
        Interactive layers enabled
      </div>
    </div>
  );
};

export default MapToolbar;