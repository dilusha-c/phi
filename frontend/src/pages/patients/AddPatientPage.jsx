import { useNavigate, Link } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import useNotification from '../../hooks/useNotification';
import { patientService } from '../../services/patientService';
import { EMPTY_PATIENT_FORM } from '../../constants/patientConstants';

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { pushNotification } = useNotification();

  const handleSubmit = async (values) => {
    try {
      const response = await patientService.createPatient(values);
      pushNotification({
        type: 'success',
        title: 'Patient registered',
        message: `${response.data.patientId} was created successfully.`,
      });
      navigate(`/patients/${response.data._id}`);
    } catch (error) {
      pushNotification({
        type: 'error',
        title: 'Registration failed',
        message: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Patients</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Add New Patient</h2>
          <p className="mt-2 text-sm text-slate-600">Register a new dengue patient in the surveillance system.</p>
        </div>
        <Link to="/patients" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Back to List
        </Link>
      </div>

      <PatientForm
        initialValues={EMPTY_PATIENT_FORM}
        submitLabel="Save Patient"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddPatientPage;
