import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';
import { patientService } from '../../services/patientService';

const EditPatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      setLoading(true);

      try {
        const response = await patientService.getPatientById(id);
        const patient = response.data;

        setInitialValues({
          ...patient,
        });
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

  const handleSubmit = async (values) => {
    try {
      const response = await patientService.updatePatient(id, values);
      pushNotification({
        type: 'success',
        title: 'Patient updated',
        message: `${response.data.patientId} has been updated successfully.`,
      });
      navigate(`/patients/${response.data._id}`);
    } catch (error) {
      pushNotification({
        type: 'error',
        title: 'Update failed',
        message: error.message,
      });
    }
  };

  if (loading || !initialValues) {
    return <LoadingSpinner label="Loading patient details..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Patients</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Edit Patient</h2>
          <p className="mt-2 text-sm text-slate-600">Update patient demographic, contact, and location information.</p>
        </div>
        <Link to={`/patients/${id}`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Back to Details
        </Link>
      </div>

      <PatientForm initialValues={initialValues} submitLabel="Update Patient" onSubmit={handleSubmit} />
    </div>
  );
};

export default EditPatientPage;
