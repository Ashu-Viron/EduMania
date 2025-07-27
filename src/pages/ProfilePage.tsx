import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BellIcon,
} from '@heroicons/react/24/outline'

interface ProfileForm {
  name: string
  email: string
  phone?: string
  company?: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      company: '',
    },
  })

  const passwordForm = useForm<PasswordForm>()

  const onProfileSubmit = async (data: ProfileForm) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateUser(data)
    setLoading(false)
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    passwordForm.reset()
    setLoading(false)
  }

  const tabs = [
    { id: 'profile', name: '프로필', icon: UserIcon },
    { id: 'security', name: '보안', icon: KeyIcon },
    { id: 'notifications', name: '알림', icon: BellIcon },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
        <p className="text-gray-600">계정 정보와 설정을 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center mb-6">
              <img
                className="mx-auto h-20 w-20 rounded-full object-cover"
                src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'}
                alt={user?.name}
              />
              <h3 className="mt-4 text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3 h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">프로필 정보</h2>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="이름"
                    {...profileForm.register('name', { required: '이름을 입력하세요' })}
                    error={profileForm.formState.errors.name?.message}
                  />
                  <Input
                    label="이메일"
                    type="email"
                    {...profileForm.register('email', { required: '이메일을 입력하세요' })}
                    error={profileForm.formState.errors.email?.message}
                  />
                  <Input
                    label="전화번호"
                    {...profileForm.register('phone')}
                  />
                  <Input
                    label="회사명"
                    {...profileForm.register('company')}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    저장
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">비밀번호 변경</h2>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <Input
                  label="현재 비밀번호"
                  type="password"
                  {...passwordForm.register('currentPassword', { required: '현재 비밀번호를 입력하세요' })}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />
                <Input
                  label="새 비밀번호"
                  type="password"
                  {...passwordForm.register('newPassword', {
                    required: '새 비밀번호를 입력하세요',
                    minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' },
                  })}
                  error={passwordForm.formState.errors.newPassword?.message}
                />
                <Input
                  label="비밀번호 확인"
                  type="password"
                  {...passwordForm.register('confirmPassword', {
                    required: '비밀번호를 다시 입력하세요',
                    validate: (value) => {
                      if (value !== passwordForm.watch('newPassword')) {
                        return '비밀번호가 일치하지 않습니다'
                      }
                    },
                  })}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    비밀번호 변경
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">이메일 알림</h3>
                    <p className="text-sm text-gray-600">새로운 견적 요청과 상담 일정을 이메일로 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">푸시 알림</h3>
                    <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">SMS 알림</h3>
                    <p className="text-sm text-gray-600">중요한 알림을 SMS로 받습니다</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}