import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const { pushNotification } = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      pushNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter both username (NIC or email) and password.'
      });
      return;
    }

    setSubmitting(true);
    const res = await login(username, password);
    setSubmitting(false);

    if (res.success) {
      pushNotification({
        type: 'success',
        title: 'Welcome Back',
        message: 'Successfully signed into the surveillance system.'
      });
      navigate('/dashboard');
    } else {
      pushNotification({
        type: 'error',
        title: 'Authentication Failed',
        message: res.message || 'Invalid credentials. Please verify your entries.'
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] border border-slate-750 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="text-center space-y-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400 border border-primary-500/30">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Surveillance Portal
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Sri Lanka Dengue Surveillance System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-3xl">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">NIC or Email Address</span>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter NIC number or Email"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                />
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                />
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full justify-center rounded-2xl bg-primary-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-900/20"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-slate-400">
            Need an inspector account?{' '}
            <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
