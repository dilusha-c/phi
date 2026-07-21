import { useMemo, useState, useContext } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, Search, Settings2, ChevronDown, LogOut, Bell } from 'lucide-react';
import { sidebarNavigation } from '../../config/navigation';
import { AuthContext } from '../../context/AuthContext';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const profile = useMemo(() => {
    if (!user) return { name: 'Guest', role: 'Visitor', initials: 'G' };
    
    const initials = user.name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      name: user.name,
      role: user.role === 'Admin' ? 'System Administrator' : user.role === 'SPHI' ? 'Supervising PHI (SPHI)' : `PHI Inspector (${user.phiId})`,
      initials,
    };
  }, [user]);

  const filteredNavigation = useMemo(() => {
    return sidebarNavigation.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.roleRestriction && user?.role !== item.roleRestriction) {
          return false;
        }
        return true;
      })
    }));
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto flex h-full w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-sm font-bold text-white shadow-soft">
                DS
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-300">Sri Lanka Dengue Surveillance</p>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">PHI Management System</h1>
              </div>
            </div>

            <div className="flex-1 px-2 lg:px-6">
              <label className="relative block max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search patients, cases, inspections, reports..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white dark:border-slate-800 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
                  {profile.initials}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Open settings menu"
              >
                <Settings2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 pt-20">
          <aside
            className={`fixed bottom-0 left-0 top-20 z-30 flex w-72 flex-col border-r border-slate-200 bg-white/95 shadow-soft transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/95 lg:translate-x-0 ${
              sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'
            } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className={`${sidebarCollapsed ? 'hidden lg:block' : 'block'}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 lg:inline-flex dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {sidebarCollapsed ? 'Expand' : 'Collapse'}
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
              {filteredNavigation.map((group) => (
                <div key={group.section} className="space-y-2">
                  <p className={`px-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 ${sidebarCollapsed ? 'lg:text-center' : ''}`}>
                    {group.section}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarItem key={item.label} item={item} collapsed={sidebarCollapsed} onNavigate={() => setSidebarOpen(false)} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {sidebarOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation overlay"
            />
          ) : null}

          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>

        <footer className={`border-t border-slate-200 bg-white/90 px-4 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400 ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-2">
            <p>© {new Date().getFullYear()} Sri Lanka Dengue Surveillance & PHI Management System</p>
            <p>Designed for PHIs, hospitals, and MOH officers</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

const SidebarItem = ({ item, collapsed, onNavigate }) => {
  const hasChildren = Boolean(item.children?.length);

  if (!hasChildren) {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
            isActive
              ? 'bg-primary-600 text-white shadow-soft dark:bg-primary-600 dark:text-white'
              : 'text-slate-700 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-primary-950/40 dark:hover:text-primary-200'
          }`
        }
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className={`${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
      </NavLink>
    );
  }

  const Icon = item.icon;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white">
        <Icon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-300" />
        <span className={`${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
      </div>
      <div className={`${collapsed ? 'lg:hidden' : ''} space-y-1 pl-3`}> 
        {item.children.map((child) => (
          <NavLink
            key={child.label}
            to={child.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            <child.icon className="h-4 w-4 shrink-0" />
            <span>{child.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AppLayout;
