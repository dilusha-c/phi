import { Navigate, Route, Routes } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PatientListPage from '../pages/patients/PatientListPage';
import AddPatientPage from '../pages/patients/AddPatientPage';
import EditPatientPage from '../pages/patients/EditPatientPage';
import PatientDetailsPage from '../pages/patients/PatientDetailsPage';
import MapViewPage from '../pages/map/MapViewPage';
import ActivityListPage from '../pages/activities/ActivityListPage';
import AddActivityPage from '../pages/activities/AddActivityPage';
import EditActivityPage from '../pages/activities/EditActivityPage';
import ActivityReportPage from '../pages/reports/ActivityReportPage';
import AreaReportPage from '../pages/reports/AreaReportPage';
import UserManagementPage from '../pages/users/UserManagementPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner label="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner label="Authenticating session..." />;
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/register" element={<AddPatientPage />} />
        <Route path="/patients/new" element={<AddPatientPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/patients/:id/edit" element={<EditPatientPage />} />
        <Route path="/activities" element={<ActivityListPage />} />
        <Route path="/activities/new" element={<AddActivityPage />} />
        <Route path="/activities/:id/edit" element={<EditActivityPage />} />
        <Route path="/reports/activity" element={<ActivityReportPage />} />
        <Route path="/reports/area" element={<AreaReportPage />} />
        <Route path="/users" element={
          <AdminRoute>
            <UserManagementPage />
          </AdminRoute>
        } />
        <Route path="/map" element={<MapViewPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
