import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Title */}
        <div className="flex-1 lg:flex-none">
          <h1 className="text-lg font-semibold text-gray-900">대시보드</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'}
              alt={user?.name}
            />
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}