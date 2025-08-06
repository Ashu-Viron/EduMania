import { useQuery } from '@tanstack/react-query'
import { dashboardAPI, estimatesAPI, consultationsAPI } from '../services/api'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { DashboardStats, Estimate, Consultation } from '../types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import DashboardPieChart from '../components/DashboardPieChart'; // NEW: Import the pie chart

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect consultants to their dashboard
  if (user?.role === 'CONSULTANT') {
    navigate('/consultant-dashboard');
    return null;
  }

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: errorDash,
    refetch: refetchDash
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.getUserStats(),
    retry: 2,
    enabled: user?.role === 'USER',
  });

  const {
    data: estimates,
    isLoading: estimatesLoading,
    isError: estimatesError,
    error: errorEstimates,
    refetch: refetchEstimates
  } = useQuery<Estimate[]>({
    queryKey: ['estimates'],
    queryFn: estimatesAPI.getAll,
    retry: 2,
    enabled: user?.role === 'USER',
  });

  const {
    data: consultations,
    isLoading: consultationsLoading,
    isError: consultationsError,
    error: errorConsultations,
    refetch: refetchConsultations
  } = useQuery<Consultation[]>({
    queryKey: ['consultations'],
    queryFn: consultationsAPI.getAll,
    retry: 2,
    enabled: user?.role === 'USER',
  });

  const isLoading = statsLoading || estimatesLoading || consultationsLoading;
  const isError = statsError || estimatesError || consultationsError;

  const errorMessage =
    errorDash?.message ||
    errorEstimates?.message ||
    errorConsultations?.message ||
    t('homePage.errorMessage');

  const recentEstimates = useMemo(() => {
    return estimates?.slice(0, 3) || [];
  }, [estimates]);

  const recentConsultations = useMemo(() => {
    return consultations?.slice(0, 3) || [];
  }, [consultations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch (e) {
      return t('common.invalidDate');
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return <Badge variant="warning">{t('status.pending')}</Badge>;
      case 'approved':
        return <Badge variant="success">{t('status.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="error">{t('status.rejected')}</Badge>;
      case 'scheduled':
        return <Badge variant="info">{t('status.scheduled')}</Badge>;
      case 'completed':
        return <Badge variant="success">{t('status.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="error">{t('status.cancelled')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex animate-pulse flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-10 w-40 rounded bg-gray-200"></div>
        </div>
        <Card>
          <div className="flex animate-pulse flex-col sm:flex-row gap-4">
            <div className="h-10 flex-1 rounded bg-gray-200"></div>
            <div className="h-10 w-40 rounded bg-gray-200"></div>
          </div>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <div className="py-12 text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-red-600">
            {t('homePage.errorTitle')}
          </h3>
          <p className="mt-2 text-gray-600">
            {errorMessage}
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              if (statsError) refetchDash();
              if (estimatesError) refetchEstimates();
              if (consultationsError) refetchConsultations();
            }}
          >
            {t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className='flex justify-between items-start'>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('homePage.welcome', { name: user?.name })} 👋
          </h1>
          <p className="text-gray-600">
            {t('homePage.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Language Switcher Dropdown */}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('homePage.totalEstimates')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalEstimates ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('homePage.pendingEstimates')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pendingEstimates ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('homePage.completedConsultations')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completedConsultations ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('homePage.totalEarnings')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.totalEarnings ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Estimate Status Chart */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('homePage.estimateStatus')}
            </h2>
            <DocumentTextIcon className="h-5 w-5 text-warning-500" />
          </div>
          {stats?.estimateStatusStats?.length ? (
            <DashboardPieChart data={stats.estimateStatusStats} />
          ) : (
            <div className="text-center py-4 text-gray-500">
              {t('homePage.noEstimateData')}
            </div>
          )}
        </Card>

        {/* Recent Consultations */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('homePage.recentConsultations')}
            </h2>
            <CalendarIcon className="h-5 w-5 text-primary-500" />
          </div>
          <div className="space-y-4">
            {recentConsultations.length > 0 ? recentConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{consultation.title}</h3>
                  <p className="text-sm text-gray-600">{consultation.consultant.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(consultation.scheduledAt)} • {consultation.duration}{t('common.minutes')}
                  </p>
                </div>
                <div>
                  {getStatusBadge(consultation.status)}
                </div>
              </div>
            )) : (
              <p className="text-center py-4 text-gray-500">
                {t('homePage.noRecentConsultations')}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Estimates */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('homePage.recentEstimates')}
            </h2>
            <DocumentTextIcon className="h-5 w-5 text-success-500" />
          </div>
          <div className="space-y-4">
            {recentEstimates.length > 0 ? recentEstimates.map((estimate) => (
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
            )) : (
              <p className="text-center py-4 text-gray-500">
                {t('homePage.noRecentEstimates')}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}