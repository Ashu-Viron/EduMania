import { useQuery } from '@tanstack/react-query'
import { mockDashboardStats, mockEstimates, mockConsultations } from '../services/mockData'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  // TrendingUpIcon, // Removed because it does not exist in @heroicons/react/24/outline
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => Promise.resolve(mockDashboardStats),
  })

  const { data: recentEstimates } = useQuery({
    queryKey: ['recent-estimates'],
    queryFn: () => Promise.resolve(mockEstimates.slice(0, 3)),
  })

  const { data: recentConsultations } = useQuery({
    queryKey: ['recent-consultations'],
    queryFn: () => Promise.resolve(mockConsultations.slice(0, 3)),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">대기중</Badge>
      case 'approved':
        return <Badge variant="success">승인됨</Badge>
      case 'rejected':
        return <Badge variant="error">거절됨</Badge>
      case 'scheduled':
        return <Badge variant="info">예정됨</Badge>
      case 'completed':
        return <Badge variant="success">완료됨</Badge>
      case 'cancelled':
        return <Badge variant="error">취소됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (!stats) return <div>Loading...</div>

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          안녕하세요! 👋
        </h1>
        <p className="text-gray-600">
          오늘의 활동을 확인하고 프로젝트를 관리하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 견적</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEstimates}</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">대기중 견적</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingEstimates}</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">완료된 상담</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedConsultations}</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 수익</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalEarnings)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Estimates */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">최근 견적</h2>
            <DocumentTextIcon className="h-5 w-5 text-success-500" />
          </div>
          <div className="space-y-4">
            {recentEstimates?.map((estimate) => (
              <div
                key={estimate.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{estimate.title}</h3>
                  <p className="text-sm text-gray-600">{estimate.clientName}</p>
                  <p className="text-sm text-gray-500">{formatDate(estimate.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(estimate.amount)}
                  </p>
                  {getStatusBadge(estimate.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">최근 상담</h2>
            <CalendarIcon className="h-5 w-5 text-primary-500" />
          </div>
          <div className="space-y-4">
            {recentConsultations?.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{consultation.title}</h3>
                  <p className="text-sm text-gray-600">{consultation.consultantName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(consultation.scheduledAt)} • {consultation.duration}분
                  </p>
                </div>
                <div>
                  {getStatusBadge(consultation.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}