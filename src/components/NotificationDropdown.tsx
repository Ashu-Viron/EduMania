import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';
import { Notification } from '../types';
import { useTranslation } from 'react-i18next';
import { BellIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: notificationAPI.getall,
    staleTime: 5 * 60 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Menu as="div" className="relative inline-block text-left z-20">
      <div>
        <Menu.Button className="relative text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary-500 rounded-full p-1">
          <span className="sr-only">{t('header.viewNotifications')}</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">{t('notification.title')}</h3>
          </div>
          <div className="py-1 max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
            {!isLoading && !notifications?.length && (
              <p className="text-center text-gray-500 py-4 text-sm">{t('notification.empty')}</p>
            )}
            {notifications?.map((notification) => (
              <Menu.Item key={notification.id}>
                {({ active }) => (
                  <button
                    className={`group flex w-full items-center px-4 py-3 text-sm transition-colors ${
                      notification.read ? 'bg-white text-gray-500' : 'bg-primary-50 text-gray-900'
                    } ${active ? 'bg-gray-100' : ''}`}
                    onClick={() => !notification.read && markAsReadMutation.mutate(notification.id)}
                  >
                    <EnvelopeIcon className={`mr-3 h-5 w-5 ${notification.read ? 'text-gray-400' : 'text-primary-600'}`} />
                    {notification.title}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}