import { useEffect, useState, useContext } from 'react';
import { User, Shield, Phone, Key, HelpCircle, BadgeCheck, Search, Trash2, Edit3, Plus, X, Users, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useNotification from '../../hooks/useNotification';
import { authService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white dark:border-slate-800 dark:bg-slate-800/70 dark:text-white';

const labelClassName = 'block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2';

const UserManagementPage = () => {
  const { pushNotification } = useNotification();
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states (Add)
  const [newName, setNewName] = useState('');
  const [newNic, setNewNic] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('PHI');
  const [newPhiId, setNewPhiId] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Form states (Edit)
  const [editName, setEditName] = useState('');
  const [editNic, setEditNic] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('PHI');
  const [editPhiId, setEditPhiId] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getAllUsers({
        search: searchQuery,
        role: roleFilter
      });
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      pushNotification({
        type: 'error',
        title: 'Query Failed',
        message: err.message || 'Unable to retrieve user list.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!newName || !newNic || !newPassword || !newPhone || !newRole) {
      pushNotification({
        type: 'warning',
        title: 'Validation Failed',
        message: 'Please complete all required fields.'
      });
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await authService.register({
        name: newName,
        nic: newNic,
        password: newPassword,
        phoneNumber: newPhone,
        role: newRole,
        phiId: newRole === 'PHI' ? newNic : undefined
      });
      if (res.success) {
        pushNotification({
          type: 'success',
          title: 'Account Created',
          message: `${newRole} user registered successfully.`
        });
        setIsAddOpen(false);
        // Clear state
        setNewName('');
        setNewNic('');
        setNewPassword('');
        setNewPhone('');
        setNewRole('PHI');
        setNewPhiId('');
        loadUsers();
      }
    } catch (err) {
      pushNotification({
        type: 'error',
        title: 'Registration Failed',
        message: err.response?.data?.message || err.message || 'Failed to create user.'
      });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditName(user.name || '');
    setEditNic(user.nic || '');
    setEditPhone(user.phoneNumber || '');
    setEditRole(user.role || 'PHI');
    setEditPhiId(user.phiId || '');
    setEditPassword('');
    setIsEditOpen(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editName || !editNic || !editPhone || !editRole) {
      pushNotification({
        type: 'warning',
        title: 'Validation Failed',
        message: 'Please enter required fields.'
      });
      return;
    }

    setSubmittingEdit(true);
    try {
      const payload = {
        name: editName,
        nic: editNic,
        phoneNumber: editPhone,
        role: editRole,
        phiId: editRole === 'PHI' ? editNic : undefined
      };
      if (editPassword) {
        payload.password = editPassword;
      }

      const res = await authService.updateUserByAdmin(selectedUser._id, payload);
      if (res.success) {
        pushNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'User settings saved successfully.'
        });
        setIsEditOpen(false);
        loadUsers();
      }
    } catch (err) {
      pushNotification({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || err.message || 'Failed to update user profile.'
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      pushNotification({
        type: 'warning',
        title: 'Restricted Action',
        message: 'You cannot delete your own logged-in Admin account.'
      });
      return;
    }

    if (!window.confirm('Are you absolutely sure you want to permanently remove this user account?')) {
      return;
    }

    try {
      const res = await authService.deleteUserByAdmin(userId);
      if (res.success) {
        pushNotification({
          type: 'success',
          title: 'Account Deleted',
          message: 'User profile permanently removed.'
        });
        loadUsers();
      }
    } catch (err) {
      pushNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Failed to delete user account.'
      });
    }
  };

  // Metrics
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const sphiCount = users.filter(u => u.role === 'SPHI').length;
  const phiCount = users.filter(u => u.role === 'PHI').length;

  return (
    <div className="space-y-6">
      {/* Title Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-300">Administrative tools</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">User Accounts Directory</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage surveillance access controls, inspector assignments, and security accounts.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 shadow-soft"
        >
          <Plus className="h-4 w-4" />
          Register New Profile
        </button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total System Users</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{users.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-500">Admin Staff</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{adminCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Supervising PHIs (SPHI)</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{sphiCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500">Inspectors (PHI)</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{phiCount}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-1 flex-wrap gap-4 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, NIC, or PHI ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs outline-none transition focus:border-primary-400 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="SPHI">SPHI</option>
              <option value="PHI">PHI</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('');
                setTimeout(() => loadUsers(), 50);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950"
            >
              Search Users
            </button>
          </div>
        </form>
      </div>

      {/* Users List Card */}
      <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <LoadingSpinner label="Compiling users directory..." />
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No system accounts matched your query.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table view */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      {['Name', 'NIC Number', 'Phone Number', 'User Role', 'PHI ID', 'Registered On', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs">
                    {users.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition">
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          {item.name}
                          {item._id === currentUser?.id && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              You
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-semibold">{item.nic || '-'}</td>
                        <td className="px-5 py-4">{item.phoneNumber}</td>
                        <td className="px-5 py-4">
                          {item.role === 'Admin' ? (
                            <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/20 dark:text-violet-400">
                              Admin
                            </span>
                          ) : item.role === 'SPHI' ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                              SPHI Staff
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                              PHI Field Inspector
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-semibold text-primary-600 dark:text-primary-400">{item.phiId || '-'}</td>
                        <td className="px-5 py-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                              title="Edit User Profile"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={item._id === currentUser?.id}
                              onClick={() => handleDeleteUser(item._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 p-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-950/20 dark:text-rose-400"
                              title="Delete User Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card list view */}
            <div className="grid gap-4 grid-cols-1 md:hidden">
              {users.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {item.name}
                        {item._id === currentUser?.id && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            You
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">NIC: {item.nic || '-'}</p>
                    </div>
                    <div>
                      {item.role === 'Admin' ? (
                        <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/20 dark:text-violet-400">
                          Admin
                        </span>
                      ) : item.role === 'SPHI' ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                          SPHI
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                          PHI
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Phone</p>
                      <p className="font-medium text-slate-700 dark:text-slate-350">{item.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">PHI ID</p>
                      <p className="font-semibold text-primary-600 dark:text-primary-400">{item.phiId || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500">Reg: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={item._id === currentUser?.id}
                        onClick={() => handleDeleteUser(item._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 p-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-rose-950/20 dark:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-6 top-6 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-500" />
                Register New User Profile
              </h3>
              <p className="text-xs text-slate-500 mt-1">Submit full details to provision a security login token.</p>
            </div>

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div>
                <span className={labelClassName}>Full Name</span>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g. Shanaka Perera"
                  className={inputClassName}
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <span className={labelClassName}>NIC Number</span>
                  <input
                    type="text"
                    required
                    value={newNic}
                    onChange={(e) => setNewNic(e.target.value)}
                    placeholder="NIC or Passport"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <span className={labelClassName}>Phone Number</span>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="077XXXXXXXX"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <span className={labelClassName}>Password</span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set login password"
                  className={inputClassName}
                />
              </div>

              <div>
                <span className={labelClassName}>Staff Role</span>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-primary-400"
                >
                  <option value="PHI">PHI Field Inspector</option>
                  <option value="SPHI">SPHI Supervisor</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                >
                  {submittingAdd ? 'Saving user...' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute right-6 top-6 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary-500" />
                Modify User Settings
              </h3>
              <p className="text-xs text-slate-500 mt-1">Update profile information or reset login password for this user.</p>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <span className={labelClassName}>Full Name</span>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <span className={labelClassName}>NIC Number</span>
                  <input
                    type="text"
                    required
                    value={editNic}
                    onChange={(e) => setEditNic(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <span className={labelClassName}>Phone Number</span>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <span className={labelClassName}>Reset Password (Optional)</span>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={inputClassName}
                />
              </div>

              <div>
                <span className={labelClassName}>Staff Role</span>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-primary-400"
                >
                  <option value="PHI">PHI Field Inspector</option>
                  <option value="SPHI">SPHI Supervisor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
                >
                  {submittingEdit ? 'Saving changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
