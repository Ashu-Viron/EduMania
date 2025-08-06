
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { consultationsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import ChatInterface from '../components/chat/ChatInterface';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { t } from 'i18next';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ConsultantChatPage() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: consultation, isLoading, isError } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => consultationsAPI.getById(consultationId!),
    enabled: !!consultationId && !!user,
  });

  useEffect(() => {
    if (isError) {
      toast.error(t('chat.error.fetchFailed'));
      console.error("Failed to fetch consultation:", consultationId);
    }
  }, [isError, consultationId]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg animate-pulse space-y-6 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gray-300"></div>
            <div className="h-6 flex-1 rounded bg-gray-300"></div>
          </div>
          <div className="h-40 rounded-md bg-gray-200"></div>
          <div className="h-12 rounded-md bg-gray-300"></div>
        </div>
      </div>
    );
  }

  if (isError || !consultation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="text-center p-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('chat.error.notFoundTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('chat.error.notFoundMessage')}</p>
          <Button variant="primary" onClick={() => navigate('/consultation')}>
            {t('chat.backToConsultations')}
          </Button>
        </Card>
      </div>
    );
  }

  const isConsultant = user?.role === 'CONSULTANT';
  const chatPartnerName = isConsultant ? consultation.user.name : consultation.consultant.user.name;
  const chatPartnerAvatar = isConsultant ? consultation.user.avatar : consultation.consultant.user.avatar;

  return (
    <div className="h-screen flex flex-col bg-white lg:rounded-2xl lg:shadow-xl lg:p-4 animate-fade-in">
      {/* Header for both mobile and desktop, with a more modern feel */}
      <div className="flex items-center gap-4 bg-white p-4 border-b lg:rounded-t-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/consultation')}
          className="p-1"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </Button>
        <div className="flex items-center gap-2">
          {chatPartnerAvatar && (
            <img src={chatPartnerAvatar} alt={chatPartnerName} className="h-10 w-10 rounded-full object-cover" />
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {t('chat.chatWith', { name: chatPartnerName })}
          </h1>
        </div>
      </div>

      {/* Chat Interface Container */}
      <div className="flex-1 overflow-hidden h-full">
        <ChatInterface
          roomId={`consultation_${consultationId}`}
          chatPartnerName={chatPartnerName}
          chatPartnerAvatar={chatPartnerAvatar}
        />
      </div>
    </div>
  );
}