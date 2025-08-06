import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import Select from '../components/ui/Select';
import { ConsultantRegisterCredentials } from '../types';
import { toast } from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  role?: 'USER' | 'CONSULTANT';
  bio?: string;
  specialties?: string;
}

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar?d=mp&s=100';

export default function LoginPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAvatarField, setShowAvatarField] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginForm>({
    defaultValues: { role: 'USER' }
  });

  const avatarUrl = watch('avatar');
  const selectedRole = watch('role');

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      let authResponse;
      if (isLogin) {
        authResponse = await authAPI.login({
          email: data.email,
          password: data.password,
        });
      } else {
        if (!data.name) {
          throw new Error(t('loginPage.nameRequired'));
        }
        
        const specialtiesArray = data.specialties
          ? data.specialties.split(',').map(s => s.trim()).filter(s => s)
          : [];
          
        const registrationData = {
          email: data.email,
          password: data.password,
          name: data.name,
          avatar: data.avatar || DEFAULT_AVATAR,
        };

        if (data.role === 'CONSULTANT') {
          const consultantRegistrationData: ConsultantRegisterCredentials = {
            ...registrationData,
            bio: data.bio || '',
            specialties: specialtiesArray,
          };
          authResponse = await authAPI.registerConsultant(consultantRegistrationData);
        } else {
          authResponse = await authAPI.register(registrationData);
        }
      }
      
      login(authResponse);
      
      if (authResponse.user.role === 'CONSULTANT') {
        navigate('/consultant-dashboard');
      } else {
        navigate('/');
      }
      toast.success(isLogin ? t('loginPage.loginSuccess') : t('loginPage.registerSuccess'));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('common.serverError');
      toast.error(errorMessage);
      console.error('Login/Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'USER' | 'CONSULTANT') => {
    setValue('password', 'password123');
    setValue('role', role);
    if (role === 'USER') {
      setValue('email', `user${Math.floor(Math.random() * 1000)}@example.com`);
      setValue('name', '김철수');
      setValue('avatar', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop');
      setValue('bio', '');
      setValue('specialties', '');
    } else {
      setValue('email', `consultant${Math.floor(Math.random() * 1000)}@example.com`);
      setValue('name', 'Consultant Jane');
      setValue('avatar', 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop');
      setValue('bio', 'Expert in web development and cloud solutions.');
      setValue('specialties', 'Next.js, Tailwind CSS, React');
    }
    setShowAvatarField(true);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-600">
            {t('appName')}
          </h1>
          <div className="relative">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="border border-gray-300 text-sm rounded-md px-3 py-1 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="en">🇺🇸 English</option>
              <option value="ko">🇰🇷 한국어</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? t('loginPage.title') : t('loginPage.title')}
            </h2>
            <p className="text-gray-600">
              {isLogin ? t('loginPage.subtitle.login') : t('loginPage.subtitle.register')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!isLogin && (
              <>
                <Select 
                  label={t('loginPage.roleLabel')}
                  {...register('role', { required: t('loginPage.roleRequired') })}
                  error={errors.role?.message as string}
                >
                  <option value="USER">{t('loginPage.role.user')}</option>
                  <option value="CONSULTANT">{t('loginPage.role.consultant')}</option>
                </Select>

                <Input
                  label={t('loginPage.name')}
                  type="text"
                  placeholder={t('loginPage.namePlaceholder')}
                  {...register('name', { required: t('loginPage.nameRequired') })}
                  error={errors.name?.message}
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('loginPage.avatarLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAvatarField(!showAvatarField)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      {showAvatarField ? t('loginPage.avatarToggle.cancel') : t('loginPage.avatarToggle.add')}
                    </button>
                  </div>

                  {showAvatarField && (
                    <Input
                      type="text"
                      placeholder="https://example.com/avatar.jpg"
                      {...register('avatar', {
                        pattern: {
                          value: /^(https?:\/\/).*\.(jpg|jpeg|png|gif|svg)$/i,
                          message: t('loginPage.avatarError'),
                        },
                      })}
                      error={errors.avatar?.message}
                    />
                  )}

                  {(avatarUrl || showAvatarField) && (
                    <div className="flex justify-center mt-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                        <img 
                          src={avatarUrl || DEFAULT_AVATAR}
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {selectedRole === 'CONSULTANT' && (
                  <>
                    <Input
                      label={t('profile.bio')}
                      type="text"
                      placeholder="e.g. Expert in web development and cloud solutions"
                      {...register('bio', { required: t('profile.required') })}
                      error={errors.bio?.message}
                    />
                    <Input
                      label={t('profile.specialties')}
                      type="text"
                      placeholder="e.g., UI/UX, Backend, Marketing"
                      {...register('specialties', { required: t('profile.required') })}
                      error={errors.specialties?.message}
                    />
                  </>
                )}
              </>
            )}
            
            <Input
              label={t('loginPage.email')}
              type="email"
              placeholder={t('loginPage.emailPlaceholder')}
              {...register('email', {
                required: t('loginPage.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('loginPage.emailInvalid'),
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label={t('loginPage.password')}
              type="password"
              placeholder={t('loginPage.passwordPlaceholder')}
              {...register('password', {
                required: t('loginPage.passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('loginPage.passwordMin'),
                },
              })}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {isLogin ? t('loginPage.submit.login') : t('loginPage.submit.register')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? t('loginPage.toggle.promptLogin') : t('loginPage.toggle.promptRegister')}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setValue('name', '');
                  setValue('avatar', '');
                  setShowAvatarField(false);
                }}
                className="ml-2 font-medium text-primary-600 hover:text-primary-800"
              >
                {isLogin ? t('loginPage.toggle.register') : t('loginPage.toggle.login')}
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 text-center mb-2">
              {t(isLogin ? 'loginPage.demoTitle.login' : 'loginPage.demoTitle.register')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('USER')}
                className="w-full"
              >
                {t('loginPage.demoButton.user')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('CONSULTANT')}
                className="w-full"
              >
                {t('loginPage.demoButton.consultant')}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              {t('loginPage.demoNote.any')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}