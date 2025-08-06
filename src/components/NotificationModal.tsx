import { Dialog } from '@headlessui/react'
import { Notification } from '../types'
import { useTranslation } from 'react-i18next'

export default function NotificationModal({
  open,
  onClose,
  notifications,
  isLoading,
  isError,
  markAsRead,
}: {
  open: boolean
  onClose: () => void
  notifications: Notification[]
  isLoading: boolean
  isError: boolean
  markAsRead: (id: string) => void
}) {
  const { t } = useTranslation()
  
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-end p-4">
        <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg shadow-xl p-4 space-y-4">
          <Dialog.Title className="text-lg font-semibold">
            {t('notification.title')}
          </Dialog.Title>

          {isLoading && <p>{t('common.loading')}</p>}
          {isError && <p>{t('notification.loadError')}</p>}

          {!isLoading&& !isError && notifications.length === 0 && (
            <p className="text-sm text-gray-500">
              {t('notification.empty')}
            </p>
          )}

          {!isLoading&& !isError &&
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-2 rounded-md ${notif.read ? 'bg-gray-100' : 'bg-primary-50'} cursor-pointer`}
                onClick={() => markAsRead(notif.id)}
              >
                <p className="text-sm text-gray-800">{notif.title}</p>
              </div>
            ))}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}