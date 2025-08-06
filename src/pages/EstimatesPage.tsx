import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimatesAPI, notificationAPI } from '../services/api';
import { Estimate } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EstimateForm from '../components/EstimateForm';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function EstimatesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [approveConfirm, setApproveConfirm] = useState<string | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);

  const isConsultant = user?.role === 'CONSULTANT';
  const dataQueryKey = 'estimates';

  const {
    data: estimates,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Estimate[], Error>({
    queryKey: [dataQueryKey, user?.id],
    queryFn: () => estimatesAPI.getAll(),
    enabled: !!user?.id && !isConsultant,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const createMutation = useMutation<Estimate, Error, any>({
    mutationFn: (data: any) => estimatesAPI.create(data),
    onSuccess: (newEstimate) => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setIsCreateModalOpen(false);
      if (user) {
        notificationAPI.create(
          t('notification.newEstimate', {
            title: newEstimate.title,
            client: newEstimate.clientName
          })
        );
      }
      toast.success(t('estimate.success'));
    },
    onError: (err) => {
      toast.error(t('estimate.error'));
      console.error("Create estimate error:", err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updateData: any }) =>
      estimatesAPI.update(data.id, data.updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setIsEditModalOpen(false);
      toast.success(t('estimate.updateSuccess'));
    },
    onError: () => {
      toast.error(t('estimate.updateError'));
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => estimatesAPI.updateStatus(id, 'APPROVED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setApproveConfirm(null);
      toast.success(t('estimate.approvedSuccess'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => estimatesAPI.updateStatus(id, 'REJECTED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setRejectConfirm(null);
      toast.success(t('estimate.rejectedSuccess'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => estimatesAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [dataQueryKey] });
      setDeleteConfirm(null);
      toast.success(t('estimate.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('estimate.deleteError'));
    },
  });

  const filteredEstimates = estimates?.filter((estimate) => {
    const matchesSearch = estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'KRW', // Assuming KRW as default currency
    }).format(amount);
  };

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
      case 'pending':
        return <Badge variant="warning">{t("estimate.status.pending")}</Badge>;
      case 'approved':
        return <Badge variant="success">{t("estimate.status.approved")}</Badge>;
      case 'rejected':
        return <Badge variant="error">{t("estimate.status.rejected")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleOpenEditModal = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsEditModalOpen(true);
  };
  const handleOpenDetailModal = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsDetailModalOpen(true);
  };
  const handleCreateEstimate = (data: any) => createMutation.mutate(data);
  const handleUpdateEstimate = (id: string, data: any) => updateMutation.mutate({ id, updateData: data });
  const handleApproveEstimate = (id: string) => setApproveConfirm(id);
  const handleRejectEstimate = (id: string) => setRejectConfirm(id);
  const handleConfirmDelete = (id: string) => setDeleteConfirm(id);

  if (isConsultant) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <DocumentTextIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            {t('estimates.accessDeniedTitle')}
          </h2>
          <p className="mb-4 text-gray-600">
            {t('estimates.accessDeniedMessage')}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/consultant-dashboard')}
          >
            {t('estimates.goToDashboard')}
          </Button>
        </Card>
      </div>
    );
  }

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
          <DocumentTextIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-red-600">
            {t('estimate.loadError')}
          </h3>
          <p className="mt-2 text-gray-600">
            {error.message || t('common.serverError')}
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => refetch()}
          >
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
            {t('estimate.title')}
          </h1>
          <p className="text-gray-600">
            {t('estimate.subtitle')}
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          <DocumentTextIcon className="mr-2 h-4 w-4" />
          {t('estimate.create')}
        </Button>
      </div>
    
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('estimate.searchPlaceholder')}
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
              <option value="all">{t('estimate.allStatus')}</option>
              <option value="PENDING">{t('estimate.status.pending')}</option>
              <option value="APPROVED">{t('estimate.status.approved')}</option>
              <option value="REJECTED">{t('estimate.status.rejected')}</option>
            </select>
          </div>
        </div>
      </Card>
    
      <div className="grid gap-6">
        {filteredEstimates?.map((estimate) => (
          <Card key={estimate.id} hover>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {estimate.title}
                  </h3>
                  {getStatusBadge(estimate.status)}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {estimate.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <strong className="text-gray-700">{t('estimate.client')}:</strong>
                    <span className="ml-1">{estimate.clientName}</span>
                  </span>
                  <span className="flex items-center">
                    <strong className="text-gray-700">{t('estimate.duration')}:</strong>
                    <span className="ml-1">{estimate.estimatedDuration}</span>
                  </span>
                  <span className="flex items-center">
                    <strong className="text-gray-700">{t('estimate.createdAt')}:</strong>
                    <span className="ml-1">{formatDate(estimate.createdAt)}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(estimate.amount)}
                </div>
                {estimate.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApproveEstimate(estimate.id)}
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      {t('estimate.approve')}
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleRejectEstimate(estimate.id)}
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {t('estimate.reject')}
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(estimate)}>
                        <PencilSquareIcon className="h-4 w-4 mr-1" />
                        {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetailModal(estimate)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {t('common.view')}
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleConfirmDelete(estimate.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      {t('common.delete')}
                    </Button>
                </div>
              </div>
            </div>
    
            <Modal
              isOpen={!!deleteConfirm && deleteConfirm === estimate.id}
              onClose={() => setDeleteConfirm(null)}
              title={t('estimate.deleteTitle')}
            >
              <div className="space-y-4">
                <p>{t('estimate.deleteConfirm')}</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                    {t('common.no')}
                  </Button>
                  <Button
                    variant="error"
                    onClick={() => deleteMutation.mutate(deleteConfirm!)}
                    loading={deleteMutation.isPending}
                  >
                    {t('common.yes')}
                  </Button>
                </div>
              </div>
            </Modal>
          </Card>
        ))}
      </div>
    
      {filteredEstimates?.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('estimate.noDataTitle')}
            </h3>
            <p className="mt-2 text-gray-600">
              {estimates?.length === 0
                ? t('estimate.noDataSubtitleEmpty')
                : t('estimate.noDataSubtitleFiltered')}
            </p>
          </div>
        </Card>
      )}
    
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('estimate.create')}
      >
        <EstimateForm
          onSubmit={handleCreateEstimate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>
    
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('estimate.edit')}
      >
        {selectedEstimate && (
          <EstimateForm
            initialData={selectedEstimate}
            onSubmit={(data) => handleUpdateEstimate(selectedEstimate.id, data)}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateMutation.isPending}
            isEdit={true}
          />
        )}
      </Modal>
    
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={t('estimate.detailTitle')}
      >
        {selectedEstimate && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedEstimate.title}</h3>
              <div className="mt-1">
                {getStatusBadge(selectedEstimate.status)}
              </div>
            </div>
    
            <div>
              <h4 className="font-medium text-gray-700">{t('estimate.description')}</h4>
              <p className="text-gray-600">{selectedEstimate.description}</p>
            </div>
    
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-700">{t('estimate.client')}</h4>
                <p>{selectedEstimate.clientName}</p>
              </div>
    
              <div>
                <h4 className="font-medium text-gray-700">{t('estimate.clientEmail')}</h4>
                <p>{selectedEstimate.clientEmail}</p>
              </div>
    
              <div>
                <h4 className="font-medium text-gray-700">{t('estimate.amount')}</h4>
                <p>{formatCurrency(selectedEstimate.amount)}</p>
              </div>
    
              <div>
                <h4 className="font-medium text-gray-700">{t('estimate.duration')}</h4>
                <p>{selectedEstimate.estimatedDuration}</p>
              </div>
    
              <div>
                <h4 className="font-medium text-gray-700">{t('estimate.createdAt')}</h4>
                <p>{formatDate(selectedEstimate.createdAt)}</p>
              </div>
            </div>
    
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={() => setIsDetailModalOpen(false)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    
      <Modal
        isOpen={!!approveConfirm}
        onClose={() => setApproveConfirm(null)}
        title={t('estimate.approveTitle')}
      >
        <div className="space-y-4">
          <p>{t('estimate.approveConfirm')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setApproveConfirm(null)}>
              {t('common.no')}
            </Button>
            <Button
              variant="success"
              onClick={() => approveMutation.mutate(approveConfirm!)}
              loading={approveMutation.isPending}
            >
              {t('common.yes')}
            </Button>
          </div>
        </div>
      </Modal>
    
      <Modal
        isOpen={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        title={t('estimate.rejectTitle')}
      >
        <div className="space-y-4">
          <p>{t('estimate.rejectConfirm')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectConfirm(null)}>
              {t('common.no')}
            </Button>
            <Button
              variant="error"
              onClick={() => rejectMutation.mutate(rejectConfirm!)}
              loading={rejectMutation.isPending}
            >
              {t('common.yes')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}