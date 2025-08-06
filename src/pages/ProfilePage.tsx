import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authAPI, consultantsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BellIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import FileUpload from '../components/ui/FileUpload';
import Switch from '../components/ui/Switch';
import { NotificationSettings } from '../types';

interface ProfileForm {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ConsultantProfileForm {
  bio: string;
  specialties: string;
  hourlyRate: number;
}

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp&s=200';

export default function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const isConsultant = user?.role === 'CONSULTANT';

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => authAPI.getProfile(),
    enabled: !!user?.id,
  });

  const { data: consultantProfileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['consultantProfile', user?.id],
    queryFn: () => consultantsAPI.getProfileForUser(user!.id),
    enabled: isConsultant && !!user?.id,
  });

  const profileForm = useForm<ProfileForm>();
  const consultantProfileForm = useForm<ConsultantProfileForm>();
  const passwordForm = useForm<PasswordForm>();

  useEffect(() => {
    if (userData) {
      profileForm.reset({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        company: userData.company || '',
      });
    }
  }, [userData, profileForm]);

  useEffect(() => {
    if (isConsultant && consultantProfileData) {
      consultantProfileForm.reset({
        bio: consultantProfileData.bio || '',
        specialties: consultantProfileData.specialties?.join(', ') || '',
        hourlyRate: consultantProfileData.hourlyRate || 0,
      });
    }
  }, [consultantProfileData, consultantProfileForm, isConsultant]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => authAPI.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      toast.success(t('profile.updateSuccess'));
    },
    onError: () => {
      toast.error(t('profile.updateError'));
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authAPI.changePassword(data),
    onSuccess: () => {
      passwordForm.reset();
      toast.success(t('profile.passwordSuccess'));
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || t('profile.passwordError');
      toast.error(errorMessage);
    }
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (settings: NotificationSettings) =>
      authAPI.updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      toast.success(t('profile.notificationsSuccess'));
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => authAPI.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      toast.success(t('profile.avatarSuccess'));
    },
    onError: () => {
      toast.error(t('profile.avatarError'));
    }
  });

  const updateConsultantProfileMutation = useMutation({
    mutationFn: (data: ConsultantProfileForm) => {
      const specialtiesArray = data.specialties.split(',').map(s => s.trim());
      return consultantsAPI.updateProfile({
        ...data,
        specialties: specialtiesArray,
        hourlyRate: Number(data.hourlyRate),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultantProfile', user?.id] });
      toast.success(t('profile.consultantProfileUpdateSuccess'));
    },
    onError: () => {
      toast.error(t('profile.consultantProfileUpdateError'));
    }
  });

  const tabs = [
    { id: 'profile', name: t('profile.tabs.profile'), icon: UserIcon },
    { id: 'security', name: t('profile.tabs.security'), icon: KeyIcon },
    { id: 'notifications', name: t('profile.tabs.notifications'), icon: BellIcon },
    ...(isConsultant ? [{ id: 'consultant', name: t('profile.tabs.consultant'), icon: BriefcaseIcon }] : [])
  ];

  const onProfileSubmit = (data: ProfileForm) => updateProfileMutation.mutate(data);
  const onPasswordSubmit = (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('profile.passwordMatchError'));
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };
  const onConsultantProfileSubmit = (data: ConsultantProfileForm) => updateConsultantProfileMutation.mutate(data);
  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    if (!userData || !userData.notifications) return;
    const newSettings = { ...userData.notifications, [key]: value };
    updateNotificationsMutation.mutate(newSettings as NotificationSettings);
  };
  const handleAvatarUpload = (file: File) => uploadAvatarMutation.mutate(file);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="lg:hidden">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="text-gray-600 mb-6">{t('profile.subtitle')}</p>
        <Card className="mb-6">
          <div className="flex flex-col items-center">
            <div className="relative inline-block">
              <img
                className="mx-auto h-24 w-24 rounded-full object-cover border-2 border-white shadow-lg"
                src={userData?.avatar || DEFAULT_AVATAR}
                alt={userData?.name}
              />
            </div>
            <FileUpload
              onFileSelect={handleAvatarUpload}
              isLoading={uploadAvatarMutation.isPending}
              className="mt-4"
            />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{userData?.name}</h3>
            <p className="text-gray-600">{userData?.email}</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block lg:w-1/4">
          <Card className="sticky top-20">
            <div className="flex flex-col items-center">
              <div className="relative inline-block">
                <img
                  className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-lg"
                  src={userData?.avatar || DEFAULT_AVATAR}
                  alt={userData?.name}
                />
              </div>
              <FileUpload
                onFileSelect={handleAvatarUpload}
                isLoading={uploadAvatarMutation.isPending}
                className="mt-4"
              />
              <h3 className="mt-4 text-lg font-medium text-gray-900">{userData?.name}</h3>
              <p className="text-gray-600">{userData?.email}</p>
              <div className="mt-2 text-sm text-gray-500 flex items-center justify-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {t('profile.memberSince')} {new Date(userData?.createdAt || '').toLocaleDateString()}
              </div>
            </div>
            <nav className="space-y-1 mt-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="block lg:hidden w-full overflow-x-auto pb-4">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-1 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 lg:w-3/4">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('profile.profileInfo')}
              </h2>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('profile.name')}
                    icon={<UserIcon className="h-5 w-5 text-gray-400" />}
                    {...profileForm.register('name', { required: t('profile.required') })}
                    error={profileForm.formState.errors.name?.message}
                  />
                  <Input
                    label={t('profile.email')}
                    type="email"
                    icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                    {...profileForm.register('email', { required: t('profile.required') })}
                    error={profileForm.formState.errors.email?.message}
                  />
                  <Input
                    label={t('profile.phone')}
                    icon={<DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />}
                    {...profileForm.register('phone')}
                  />
                  <Input
                    label={t('profile.company')}
                    icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
                    {...profileForm.register('company')}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={updateProfileMutation.isPending}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('profile.passwordChange')}
              </h2>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <Input
                  label={t('profile.currentPassword')}
                  type="password"
                  icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
                  {...passwordForm.register('currentPassword', {
                    required: t('profile.required')
                  })}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />
                <Input
                  label={t('profile.newPassword')}
                  type="password"
                  icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
                  {...passwordForm.register('newPassword', {
                    required: t('profile.required'),
                    minLength: {
                      value: 6,
                      message: t('profile.passwordLength')
                    },
                  })}
                  error={passwordForm.formState.errors.newPassword?.message}
                />
                <Input
                  label={t('profile.confirmPassword')}
                  type="password"
                  icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
                  {...passwordForm.register('confirmPassword', {
                    required: t('profile.required'),
                    validate: (value) =>
                      value === passwordForm.watch('newPassword') ||
                      t('profile.passwordMatchError')
                  })}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={updatePasswordMutation.isPending}
                  >
                    {t('profile.changePassword')}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('profile.notificationSettings')}
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {t('profile.notificationMethods')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{t('profile.email')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.emailDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.email || false}
                        onChange={(checked) => handleNotificationChange('email', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{t('profile.push')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.pushDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.push || false}
                        onChange={(checked) => handleNotificationChange('push', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{t('profile.sms')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.smsDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.sms || false}
                        onChange={(checked) => handleNotificationChange('sms', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {t('profile.notificationTypes')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {t('profile.newEstimates')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.newEstimatesDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.newEstimates || false}
                        onChange={(checked) => handleNotificationChange('newEstimates', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {t('profile.estimateUpdates')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.estimateUpdatesDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.estimateUpdates || false}
                        onChange={(checked) => handleNotificationChange('estimateUpdates', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {t('profile.newConsultations')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.newConsultationsDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.newConsultations || false}
                        onChange={(checked) => handleNotificationChange('newConsultations', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {t('profile.consultationReminders')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('profile.consultationRemindersDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userData?.notifications?.consultationReminders || false}
                        onChange={(checked) => handleNotificationChange('consultationReminders', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {isConsultant && activeTab === 'consultant' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('profile.consultantInfo')}
              </h2>
              <form onSubmit={consultantProfileForm.handleSubmit(onConsultantProfileSubmit)} className="space-y-6">
                <Input
                  label={t('profile.bio')}
                  {...consultantProfileForm.register('bio')}
                />
                <Input
                  label={t('profile.specialties')}
                  placeholder="e.g., UI/UX, Backend, Marketing"
                  {...consultantProfileForm.register('specialties')}
                />
                <Input
                  label={t('profile.hourlyRate')}
                  type="number"
                  {...consultantProfileForm.register('hourlyRate', { valueAsNumber: true })}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={updateConsultantProfileMutation.isPending}>
                    {t('common.save')}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}