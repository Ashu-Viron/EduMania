import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../stores/uiStore'; // NEW: Import the UI store
import NotificationDropdown from './NotificationDropdown'; // NEW: Import the notification component

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen); // NEW: Get the function to toggle the sidebar

  const isConsultant = user?.role === 'CONSULTANT';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isConsultant
    ? [
        { path: '/consultant-dashboard', name: t('nav.dashboard'), icon: HomeIcon },
        { path: '/consultation', name: t('nav.consultations'), icon: ChatBubbleLeftRightIcon },
        { path: '/profile', name: t('nav.profile'), icon: UserCircleIcon },
      ]
    : [
        { path: '/', name: t('nav.home'), icon: HomeIcon },
        { path: '/estimates', name: t('nav.estimates'), icon: DocumentTextIcon },
        { path: '/consultation', name: t('nav.consultations'), icon: ChatBubbleLeftRightIcon },
        { path: '/profile', name: t('nav.profile'), icon: UserCircleIcon },
      ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="-ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <NavLink to={isConsultant ? '/consultant-dashboard' : '/'} className="ml-4 text-2xl font-bold text-primary-600">
              {t('appName')}
            </NavLink>
          </div>

          {/* Desktop Logo & Navigation Links */}
          <div className="hidden lg:flex lg:items-center">
            <NavLink to={isConsultant ? '/consultant-dashboard' : '/'} className="text-2xl font-bold text-primary-600">
              {t('appName')}
            </NavLink>
            <nav className="hidden md:flex md:space-x-8 ml-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200  
                    ${isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`
                  }
                >
                  <item.icon className="mr-1 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center space-x-4">
            <NotificationDropdown /> {/* NEW: Use the new notification component */}
            <Button variant="ghost" onClick={handleLogout} className="hidden md:flex">
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}