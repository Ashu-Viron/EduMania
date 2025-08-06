import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Button from './ui/Button';
import { useUIStore } from '../stores/uiStore'; // NEW: Import the UI store

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useUIStore(); // NEW: Get the store state and setter

  const isConsultant = user?.role === 'CONSULTANT';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setSidebarOpen(false); // Close sidebar on logout
  };

  const navItems = isConsultant
    ? [
        { path: '/consultant-dashboard', name: t('nav.dashboard'), icon: ChartBarSquareIcon },
        { path: '/consultation', name: t('nav.consultations'), icon: ChatBubbleLeftRightIcon },
        { path: '/profile', name: t('nav.profile'), icon: UserCircleIcon },
      ]
    : [
        { path: '/', name: t('nav.home'), icon: HomeIcon },
        { path: '/estimates', name: t('nav.estimates'), icon: DocumentTextIcon },
        { path: '/consultation', name: t('nav.consultations'), icon: ChatBubbleLeftRightIcon },
        { path: '/profile', name: t('nav.profile'), icon: UserCircleIcon },
      ];

  const handleNavLinkClick = () => {
    // Close the sidebar on mobile after clicking a link
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:border-r lg:border-gray-200 lg:bg-white`}
    >
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between flex-shrink-0 px-4">
          <NavLink to={isConsultant ? '/consultant-dashboard' : '/'} className="text-2xl font-bold text-primary-600">
            {t('appName')}
          </NavLink>
          {/* Close button for mobile sidebar */}
          <button
            type="button"
            className="-mr-2 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavLinkClick}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 
                  ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`mr-3 h-6 w-6 
                        ${isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
            {t('common.logout')}
          </Button>
        </div>
      </div>
    </aside>
  );
}