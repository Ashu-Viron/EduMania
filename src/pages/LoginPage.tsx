import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { mockUser } from '../services/mockData'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock login - in real app, this would call the API
    login(mockUser, 'mock-access-token')
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">EduPlatform</h1>
            <p className="text-gray-600">
              {isLogin ? '로그인하여 계속하세요' : '새 계정을 만드세요'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="이메일"
              type="email"
              placeholder="your@email.com"
              {...register('email', {
                required: '이메일을 입력하세요',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '올바른 이메일 형식이 아닙니다',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: '비밀번호를 입력하세요',
                minLength: {
                  value: 6,
                  message: '비밀번호는 최소 6자 이상이어야 합니다',
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
              {isLogin ? '로그인' : '회원가입'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </div>

          {/* Demo notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>데모 계정:</strong><br />
              아무 이메일과 비밀번호로 로그인 가능합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}