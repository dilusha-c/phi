import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PatientFilters from '../../components/patients/PatientFilters';
import PatientTable from '../../components/patients/PatientTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useNotification from '../../hooks/useNotification';
import { patientService } from '../../services/patientService';

const defaultFilters = {
  name: '',
  dengueSourcePlaceType: '',
  limit: '10',
};

const defaultPagination = {
  page: 1,
  limit: 10,
  totalRecords: 0,
  totalPages: 1,
};

const PatientListPage = () => {
  const { pushNotification } = useNotification();
  const [patients, setPatients] = useState([]);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState(defaultPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadPatients = async () => {
    setLoading(true);

    try {
      const response = await patientService.getPatients({
        dengueSourcePlaceType: appliedFilters.dengueSourcePlaceType,
        name: appliedFilters.name,
        limit: appliedFilters.limit,
        page: currentPage,
      });

      setPatients(response.data || []);
      setPagination({
        page: response.meta?.page || currentPage,
        limit: response.meta?.limit || Number(appliedFilters.limit),
        totalRecords: response.meta?.totalRecords || 0,
        totalPages: response.meta?.totalPages || 1,
      });
    } catch (error) {
      pushNotification({
        type: 'error',
        title: 'Unable to load patients',
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [appliedFilters, currentPage, refreshTick]);

  const handleFilterChange = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedFilters(draftFilters);
  };

  const handleClear = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deletingPatient) {
      return;
    }

    try {
      await patientService.deletePatient(deletingPatient._id);
      pushNotification({
        type: 'success',
        title: 'Patient deleted',
        message: `${deletingPatient.patientId} was removed successfully.`,
      });
      setDeletingPatient(null);
      setRefreshTick((value) => value + 1);
    } catch (error) {
      pushNotification({
        type: 'error',
        title: 'Delete failed',
        message: error.message,
      });
    }
  };

  const goToPage = (nextPage) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), pagination.totalPages);
    setCurrentPage(boundedPage);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Patients</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Patient Registration Dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Search, register, update, and monitor dengue patient records across the surveillance network.
            </p>
          </div>
          <Link
            to="/patients/register"
            className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Add New Patient
          </Link>
        </div>
      </section>

      <PatientFilters
        filters={draftFilters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={loading}
      />

      <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Registered Patients</h3>
            <p className="text-sm text-slate-500">
              {pagination.totalRecords} total records · Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
          <div className="rounded-2xl bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
            Showing {patients.length} patients
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingSpinner label="Loading patient list..." />
          ) : (
            <PatientTable patients={patients} onDelete={setDeletingPatient} />
          )}
        </div>

        {pagination.totalPages > 1 && !loading ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(deletingPatient)}
        title="Delete patient record?"
        message={deletingPatient ? `This will permanently remove ${deletingPatient.patientId}.` : ''}
        confirmLabel="Delete"
        onCancel={() => setDeletingPatient(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default PatientListPage;
