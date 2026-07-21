import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import NotificationToast from './components/common/NotificationToast';

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <NotificationToast />
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
