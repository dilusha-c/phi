import { ArrowUpRight, CalendarDays, MapPin, Hospital, UserCircle2, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
    <Icon className="mt-0.5 h-4 w-4 text-primary-600 dark:text-primary-300" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value || '-'}</p>
    </div>
  </div>
);

const CaseDetailsPanel = ({ selectedCase }) => {
  if (!selectedCase) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Select a marker to inspect details, map location, and surveillance info.
      </div>
    );
  }

  // Check if the selected item is a Daily Activity log pin
  if (selectedCase.markerType && selectedCase.markerType !== 'Patient') {
    const coordinates = Array.isArray(selectedCase.location?.coordinates) ? selectedCase.location.coordinates : [];
    const log = selectedCase.raw || {};
    const act = log.selectedActivity || {};

    return (
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">PHI Daily Activity</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedCase.id}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Submitter: {log.phiName || log.phiId}</p>
          </div>
          <Link
            to="/activities"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-sm"
          >
            All Logs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          <DetailRow icon={ClipboardCheck} label="Activity Type" value={act.activityType} />
          {act.activityType === 'Other' && act.customActivityType && (
            <DetailRow icon={ClipboardCheck} label="Custom Type Description" value={act.customActivityType} />
          )}
          {act.activityType === 'Dengue Patients Home Visit' && act.patientName && (
            <DetailRow icon={UserCircle2} label="Visited Patient" value={act.patientName} />
          )}
          <DetailRow icon={CalendarDays} label="Log Date" value={log.date ? new Date(log.date).toLocaleDateString() : '-'} />
          <DetailRow icon={MapPin} label="Typed Location" value={act.location?.name || '-'} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailRow icon={MapPin} label="Latitude" value={coordinates[1] ? Number(coordinates[1]).toFixed(6) : '-'} />
          <DetailRow icon={MapPin} label="Longitude" value={coordinates[0] ? Number(coordinates[0]).toFixed(6) : '-'} />
        </div>

        {act.notes && (
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Activity Notes</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">"{act.notes}"</p>
          </div>
        )}
      </aside>
    );
  }

  // Fallback / standard Case Details view
  const c = selectedCase.raw || {};
  const patient = c.patient || {};
  const coordinates = Array.isArray(c.location?.coordinates) ? c.location.coordinates : [];

  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Dengue Patient Case</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedCase.id}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{c.hospital || 'Hospital Record'}</p>
        </div>
        {patient._id ? (
          <Link
            to={`/patients/${patient._id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 shadow-sm"
          >
            Open Patient
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="space-y-3">
        <DetailRow icon={UserCircle2} label="Patient" value={`${patient.patientId || '-'} - ${patient.firstName || ''} ${patient.lastName || ''}`.trim()} />
        <DetailRow icon={CalendarDays} label="Diagnosis Date" value={c.diagnosisDate ? new Date(c.diagnosisDate).toLocaleDateString() : '-'} />
        <DetailRow icon={Hospital} label="Hospital" value={c.hospital} />
        <DetailRow icon={MapPin} label="Location" value={c.location?.address || c.location?.district || '-'} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow icon={MapPin} label="District" value={c.location?.district} />
        <DetailRow icon={MapPin} label="MOH Area" value={c.location?.mohArea} />
        <DetailRow icon={MapPin} label="Latitude" value={coordinates[1] ? Number(coordinates[1]).toFixed(6) : '-'} />
        <DetailRow icon={MapPin} label="Longitude" value={coordinates[0] ? Number(coordinates[0]).toFixed(6) : '-'} />
      </div>

      <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Surveillance Status</p>
        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{c.currentStatus}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Severity: {c.severity}</p>
      </div>
    </aside>
  );
};

export default CaseDetailsPanel;