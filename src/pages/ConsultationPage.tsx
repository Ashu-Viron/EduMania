import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationsAPI } from '../services/api';
import { Consultation } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConsultationForm from '../components/ConsultationForm';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  PencilSquareIcon,
  XMarkIcon,
  EyeIcon,
  CheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function ConsultationPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isConsultant = user?.role === 'CONSULTANT';
  const dataQueryKey = isConsultant ? 'consultantConsultations' : 'consultations';

  const {
    data: consultations,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Consultation[], Error>({
    queryKey: [dataQueryKey, user?.id],
    queryFn: () => isConsultant
      ? consultationsAPI.getAllForConsultant()
      : consultationsAPI.getAll(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const createMutation = useMutation<Consultation, Error, any>({
    mutationFn: async (data: any) => {
      const { status, ...createData } = data;
      return consultationsAPI.create({
        ...createData,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        consultantId: data.consultantId
      });
    },
    onSuccess: (newConsultation) => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setIsCreateModalOpen(false);
      if (user) {
        notificationAPI.create(
          t('notification.newConsultation', {
            title: newConsultation.title,
            time: formatDate(newConsultation.scheduledAt)
          })
        );
      }
      toast.success(t('consultation.success'));
    },
    onError: (err) => {
      toast.error(t('consultation.error'));
      console.error("Create consultation error:", err);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updateData: any }) =>
      consultationsAPI.update(data.id, data.updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setIsEditModalOpen(false);
      toast.success(t('consultation.updateSuccess'));
    },
    onError: () => {
      toast.error(t('consultation.updateError'));
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => consultationsAPI.updateStatus(id, 'COMPLETED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      toast.success(t('consultation.completedSuccess'));
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => consultationsAPI.updateStatus(id, 'CANCELLED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setCancelConfirm(null);
      toast.success(t('consultation.cancelledSuccess'));
    },
    onError: () => {
      toast.error(t('consultation.cancelError'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => consultationsAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setDeleteConfirm(null);
      toast.success(t('consultation.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('consultation.deleteError'));
    }
  });

  const filteredConsultations = consultations?.filter((consultation) => {
    const matchesSearch = consultation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isConsultant ? consultation.user.name.toLowerCase() : consultation.consultant.user.name.toLowerCase()).includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch (e) {
      return t('common.invalidDate');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge variant="info">{t("consultation.status.scheduled")}</Badge>;
      case 'completed':
        return <Badge variant="success">{t("consultation.status.completed")}</Badge>;
      case 'cancelled':
        return <Badge variant="error">{t("consultation.status.cancelled")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleOpenEditModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsEditModalOpen(true);
  };
  const handleOpenDetailModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsDetailModalOpen(true);
  };
  const handleCreateConsultation = (data: any) => createMutation.mutate(data);
  const handleUpdateConsultation = (id: string, data: any) => updateMutation.mutate({ id, updateData: data });
  const handleConfirmCancel = (id: string) => setCancelConfirm(id);
  const handleConfirmDelete = (id: string) => setDeleteConfirm(id);

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
          <h3 className="mt-4 text-lg font-medium text-red-600">{t('consultation.loadErrorTitle')}</h3>
          <p className="mt-2 text-gray-600">
            {error.message || t('common.serverError')}
          </p>
          <Button variant="primary" className="mt-4" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className=" animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('consultation.title')}
          </h1>
          <p className="text-gray-600">
            {isConsultant ? t('consultation.consultantSubtitle') : t('consultation.subtitle')}
          </p>
        </div>
        {!isConsultant && (
          <Button variant="primary" onClick={handleOpenCreateModal}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {t('consultation.create')}
          </Button>
        )}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={isConsultant ? t('consultation.searchConsultantPlaceholder') : t('consultation.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('consultation.allStatus')}</option>
              <option value="SCHEDULED">{t('consultation.status.scheduled')}</option>
              <option value="COMPLETED">{t('consultation.status.completed')}</option>
              <option value="CANCELLED">{t('consultation.status.cancelled')}</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {filteredConsultations?.map((consultation) => (
          <Card key={consultation.id} hover>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {consultation.title}
                  </h3>
                  {getStatusBadge(consultation.status)}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {consultation.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <strong className="text-gray-700">
                      {isConsultant ? t('consultation.client') : t('consultation.consultant')}
                      :
                    </strong>
                    <span className="ml-1">
                      {isConsultant ? consultation.user.name : consultation.consultant.user.name}
                    </span>
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(consultation.scheduledAt)}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {consultation.duration} {t('common.minutes')}
                  </span>
                </div>
                {consultation.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>{t('consultation.notes')}:</strong> {consultation.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                {isConsultant && consultation.status === 'SCHEDULED' && (
                  <>
                    <Button variant="success" size="sm" onClick={() => completeMutation.mutate(consultation.id)} loading={completeMutation.isPending}>
                      <CheckIcon className="h-4 w-4 mr-1" />
                      {t('consultation.markCompleted')}
                    </Button>
                    <Button variant="error" size="sm" onClick={() => handleConfirmCancel(consultation.id)} loading={cancelMutation.isPending}>
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {t('consultation.cancel')}
                    </Button>
                  </>
                )}
                {!isConsultant && consultation.status === 'SCHEDULED' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(consultation)}>
                      <PencilSquareIcon className="h-4 w-4 mr-1" />
                      {t('consultation.edit')}
                    </Button>
                    <Button variant="error" size="sm" onClick={() => handleConfirmCancel(consultation.id)}>
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {t('consultation.cancel')}
                    </Button>
                  </>
                )}
                {!isConsultant && (
                    <Button variant="error" size="sm" onClick={() => handleConfirmDelete(consultation.id)}>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {t('consultation.delete')}
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenDetailModal(consultation)}>
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {t('consultation.view')}
                </Button>
                {consultation.status === 'SCHEDULED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/chat/${consultation.id}`)}
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    {t('consultation.chat')}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            <Modal
              isOpen={!!deleteConfirm && deleteConfirm === consultation.id}
              onClose={() => setDeleteConfirm(null)}
              title={t('consultation.deleteTitle')}
            >
              <div className="space-y-4">
                <p>{t('consultation.deleteConfirm')}</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                    {t('consultation.noDelete')}
                  </Button>
                  <Button
                    variant="error"
                    onClick={() => deleteMutation.mutate(deleteConfirm!)}
                    loading={deleteMutation.isPending}
                  >
                    {t('consultation.yesDelete')}
                  </Button>
                </div>
              </div>
            </Modal>
          </Card>
        ))}
      </div>

      {filteredConsultations?.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t('consultation.noDataTitle')}</h3>
            <p className="mt-2 text-gray-600">
              {consultations?.length === 0
                ? t('consultation.noDataSubtitleEmpty')
                : t('consultation.noDataSubtitleFiltered')}
            </p>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('consultation.create')}
      >
        <ConsultationForm
          onSubmit={handleCreateConsultation}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('consultation.edit')}
      >
        {selectedConsultation && (
          <ConsultationForm
            initialData={{
              ...selectedConsultation,
              consultantId: selectedConsultation.consultant.id
            }}
            onSubmit={(data) => handleUpdateConsultation(selectedConsultation.id, data)}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateMutation.isPending}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={t("consultation.consultationDetail")}
      >
        {selectedConsultation && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedConsultation.title}</h3>
              <div className="mt-1">
                {getStatusBadge(selectedConsultation.status)}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">{t("consultation.explanation")}</h4>
              <p className="text-gray-600">{selectedConsultation.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-700">
                  {isConsultant ? t("consultation.client") : t("consultation.consultant")}
                </h4>
                <p>
                  {isConsultant ? selectedConsultation.user.name : selectedConsultation.consultant.user.name}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">{t("consultation.scheduledAt")}</h4>
                <p>{formatDate(selectedConsultation.scheduledAt)}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">{t("consultation.timetaken")}</h4>
                <p>{selectedConsultation.duration} {t("consultationForm.lablelduration")}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700">{t("consultation.creationdate")}</h4>
                <p>{formatDate(selectedConsultation.createdAt)}</p>
              </div>
            </div>
            
            {selectedConsultation.notes && (
              <div>
                <h4 className="font-medium text-gray-700">{t("consultation.notes")}</h4>
                <p className="text-gray-600">{selectedConsultation.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                {t("consultation.close")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        title={t('consultation.cancel')}
      >
        <div className="space-y-4">
          <p>{t('consultation.cancelConfirm')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelConfirm(null)}>
              {t('consultation.noCancel')}
            </Button>
            <Button
              variant="error"
              onClick={() => cancelMutation.mutate(cancelConfirm!)}
              loading={cancelMutation.isPending}
            >
              {t('consultation.yesCancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}