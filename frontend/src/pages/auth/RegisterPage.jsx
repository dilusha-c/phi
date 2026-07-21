import { useState, useContext } from 'react';
import { useNavigate as useNav, Link as RouterLink } from 'react-router-dom';
import { User, Shield, Phone, Key, HelpCircle, BadgeCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const { pushNotification } = useNotification();
  const navigate = useNav();

  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('PHI');
  const [phiId, setPhiId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !nic || !password || !phoneNumber || !role) {
      pushNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      nic,
      password,
      phoneNumber,
      role,
      phiId: role === 'PHI' ? (phiId.trim() || undefined) : undefined
    };

    const res = await register(payload);
    setSubmitting(false);

    if (res.success) {
      pushNotification({
        type: 'success',
        title: 'Registration Successful',
        message: 'Your account has been created. You can now log in.'
      });
      navigate('/login');
    } else {
      pushNotification({
        type: 'error',
        title: 'Registration Failed',
        message: res.message || 'Unable to create account. Please verify details.'
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 rounded-[2.5rem] border border-slate-750 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="text-center space-y-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400 border border-primary-500/30">
            <BadgeCheck className="h-6 w-6" />
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Account Registration
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Create an SPHI or PHI system profile
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</span>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Shanaka Perera"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                />
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">NIC Number</span>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  placeholder="NIC or passport"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                />
                <Shield className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="077XXXXXXXX"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                />
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Password</span>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose password"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                />
                <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">User Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
              >
                <option value="PHI" className="bg-slate-800">Public Health Inspector (PHI)</option>
                <option value="SPHI" className="bg-slate-800">Supervising PHI (SPHI)</option>
              </select>
            </label>

            {role === 'PHI' && (
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">PHI ID (Optional)</span>
                <div className="relative">
                  <input
                    type="text"
                    value={phiId}
                    onChange={(e) => setPhiId(e.target.value)}
                    placeholder="E.g. PHI-001 (or NIC default)"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-primary-400 focus:bg-slate-850"
                  />
                  <HelpCircle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full justify-center rounded-2xl bg-primary-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-900/20"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-slate-400">
            Already have an account?{' '}
            <RouterLink to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition">
              Login here
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
