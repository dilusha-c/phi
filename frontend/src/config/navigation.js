import {
  LayoutDashboard,
  Users,
  FileText,
  MapPinned,
  PlusCircle,
  BarChart3,
  Bell,
  ClipboardList,
} from 'lucide-react';

export const sidebarNavigation = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      {
        label: 'Patient Management',
        icon: Users,
        children: [
          { label: 'Patient List', path: '/patients', icon: FileText },
          { label: 'Register Patient', path: '/patients/register', icon: PlusCircle },
        ],
      },
      {
        label: 'Daily Activity',
        icon: ClipboardList,
        children: [
          { label: 'Activity List', path: '/activities', icon: FileText },
          { label: 'Log Daily Activity', path: '/activities/new', icon: PlusCircle },
        ],
      },
      {
        label: 'Reports',
        icon: BarChart3,
        children: [
          { label: 'Activity Report', path: '/reports/activity', icon: FileText },
          { label: 'Report by Area', path: '/reports/area', icon: FileText },
        ],
      },
      { label: 'Map View', path: '/map', icon: MapPinned },
      { label: 'User Management', path: '/users', icon: Users, roleRestriction: 'Admin' },
    ],
  },
];

export const topNavActions = [
  { label: 'Notifications', icon: Bell },
];
