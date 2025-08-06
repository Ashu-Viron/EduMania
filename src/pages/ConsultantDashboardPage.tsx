import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import { ChartBarSquareIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { consultationsAPI, dashboardAPI } from '../services/api';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import DashboardChart from '../components/DashboardChart';
import { ConsultantDashboardStats } from '../types'; // NEW: Import the new type

export default function ConsultantDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery<ConsultantDashboardStats>({ // FIX: Use the new type
    queryKey: ['consultantDashboardStats', user?.id],
    queryFn: () => dashboardAPI.getConsultantStats(), // FIX: Call the correct API method
    enabled: user?.role === 'CONSULTANT' && !!user?.id,
  });

  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['consultantConsultations', user?.id],
    queryFn: () => consultationsAPI.getAllForConsultant(),
    enabled: user?.role === 'CONSULTANT' && !!user?.id,
  });

  const isLoading = statsLoading || consultationsLoading;
  
  const totalConsultations = stats?.totalConsultations ?? 0;
  const upcomingConsultationsCount = stats?.upcomingConsultations ?? 0; // FIX: Get count from stats
  const totalHours = stats?.totalHours ?? 0; // FIX: Get hours from stats
  const recentConsultations = consultations?.filter(c => c.status === 'SCHEDULED')?.slice(0, 3) || [];
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('consultantDashboard.title', { name: user?.name })}</h1>
        <p className="text-gray-600">{t('consultantDashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('consultantDashboard.totalConsultations')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalConsultations}
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
                {t('consultantDashboard.upcomingConsultations')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingConsultationsCount}
              </p>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <ChartBarSquareIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t('consultantDashboard.totalHours')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalHours.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('consultantDashboard.monthlyConsultations')}
          </h2>
          <DashboardChart data={stats?.monthlyStats || []} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('consultantDashboard.upcomingAppointments')}
            </h2>
            <Button variant="ghost" onClick={() => navigate('/consultation')}>
              {t('common.viewAll')}
            </Button>
          </div>
          <div className="space-y-4">
            {recentConsultations.length > 0 ? (
              recentConsultations.map(c => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">{c.title}</div>
                  <div className="text-sm text-gray-600">
                    {t('consultantDashboard.withClient', { clientName: c.user.name })} on {new Date(c.scheduledAt).toLocaleDateString()}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => navigate(`/chat/${c.id}`)}
                  >
                    {t('consultantDashboard.startChat')}
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">{t('consultantDashboard.noAppointments')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}