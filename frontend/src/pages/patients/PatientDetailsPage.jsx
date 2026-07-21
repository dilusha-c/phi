import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';
import { patientService } from '../../services/patientService';

const DetailItem = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</p>
  </div>
);

const PatientDetailsPage = () => {
  const { id } = useParams();
  const { pushNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      setLoading(true);

      try {
        const response = await patientService.getPatientById(id);
        setPatient(response.data);
      } catch (error) {
        pushNotification({
          type: 'error',
          title: 'Unable to load patient',
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, pushNotification]);

  if (loading) {
    return <LoadingSpinner label="Loading patient record..." />;
  }

  if (!patient) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        Patient record was not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Patient Profile</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {patient.firstName} {patient.lastName}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">Patient ID: {patient.patientId}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/patients"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to List
          </Link>
          <Link
            to={`/patients/${patient._id}/edit`}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Edit Patient
          </Link>
        </div>
      </div>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur lg:grid-cols-3">
        <DetailItem label="First Name" value={patient.firstName} />
        <DetailItem label="Last Name" value={patient.lastName} />
        <DetailItem label="Gender" value={patient.gender} />
        <DetailItem label="Dengue Source Place Type" value={patient.dengueSourcePlaceType} />
        <DetailItem label="Address" value={patient.address} />
        <DetailItem label="Province" value={patient.province} />
        <DetailItem label="District" value={patient.district} />
        <DetailItem label="MOH Area" value={patient.mohArea} />
        <DetailItem label="GN Division" value={patient.gnDivision} />
        <DetailItem label="Dengue Source Place Type" value={patient.dengueSourcePlaceType} />
        <DetailItem label="Dengue Source Place" value={patient.dengueSourcePlace} />
        <DetailItem label="Registration Date" value={patient.registrationDate ? new Date(patient.registrationDate).toLocaleString() : '-'} />
      </section>
    </div>
  );
};

export default PatientDetailsPage;
