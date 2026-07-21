import { Link } from 'react-router-dom';

const PatientTable = ({ patients, onDelete }) => {
  if (!patients.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        No patients found. Register a new patient to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Patient ID', 'Name', 'District', 'Source Place Type', 'Actions'].map((header) => (
                <th key={header} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {patients.map((patient) => (
              <tr key={patient._id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 text-sm font-semibold text-slate-900">{patient.patientId}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{patient.firstName} {patient.lastName}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{patient.district}</td>
                <td className="px-5 py-4 text-sm text-slate-700">{patient.dengueSourcePlaceType}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/patients/${patient._id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                    <Link
                      to={`/patients/${patient._id}/edit`}
                      className="rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(patient)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;
