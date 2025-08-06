import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { consultantsAPI } from '../services/api';
import Input from './ui/Input';
import Button from './ui/Button';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import { ConsultantListItem } from '../types';

interface ConsultationFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function ConsultationForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: ConsultationFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isConsultant = user?.role === 'CONSULTANT';

  const { data: availableConsultants, isLoading: isConsultantsLoading } = useQuery<ConsultantListItem[]>({
    queryKey: ['availableConsultants'],
    queryFn: consultantsAPI.getAll,
    enabled: !isConsultant,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      // FIX: Use the consultant's user ID from the nested object
      consultantId: initialData?.consultant?.user?.id || '',
      scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
      duration: initialData?.duration || 60,
      notes: initialData?.notes || '',
      status: initialData?.status || 'SCHEDULED',
    },
  });

  const handleFormSubmit = (data: any) => {
    const formattedData = {
      ...data,
      duration: Number(data.duration),
      status: data.status || 'SCHEDULED',
    };
    onSubmit(formattedData);
  };
  
  if (!isConsultant && isConsultantsLoading) {
    return <p className="text-center p-4">{t('common.loading')}</p>;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label={t('consultationForm.title')}
        placeholder={t('consultationForm.placeholder')}
        {...register('title', { required: t('consultationForm.errorTitleRequired') })}
        error={errors.title?.message as string}
      />
      
      <Textarea
        label={t('consultationForm.ExplanationName')}
        placeholder={t('consultationForm.ConsultationExplnationPlaceholder')}
        {...register('description', { required: t('consultationForm.errorDescriptionRequired') })}
        error={errors.description?.message as string}
        rows={3}
      />

      {!isConsultant && (
        <Select
          label={t('consultationForm.ConsultantName')}
          {...register('consultantId', { required: t('consultationForm.errorConsultantRequired') })}
          error={errors.consultantId?.message as string}
        >
          <option value="">{t('consultationForm.selectConsultant')}</option>
          {availableConsultants?.map(consultant => (
            <option key={consultant.id} value={consultant.id}>
              {consultant.name}
            </option>
          ))}
        </Select>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultationForm.labelDate')}</label>
          <div className="relative">
            <input
              type="datetime-local"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register('scheduledAt', { required: t('consultationForm.errorScheduleRequired') })}
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {errors.scheduledAt && (
            <p className="mt-1 text-sm text-red-600">
              {errors.scheduledAt.message as string}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultationForm.lablelduration')}</label>
          <div className="relative">
            <input
              type="number"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register('duration', {
                required: t('consultationForm.errorDurationRequired'),
                min: { value: 15, message: t('consultationForm.errorDurationMin') },
                max: { value: 240, message: t('consultationForm.errorDurationMax') }
              })}
            />
            <ClockIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">
              {errors.duration.message as string}
            </p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultationForm.labelNote')}</label>
        <Textarea
          placeholder={t('consultationForm.placehoderNotes')}
          {...register('notes')}
          rows={2}
        />
      </div>
      
      {isEdit && isConsultant && (
        <Select
          label={t('consultationForm.status')}
          {...register('status', { required: t('consultationForm.errorStatusRequired') })}
          error={errors.status?.message as string}
        >
          <option value="SCHEDULED">{t('consultation.status.scheduled')}</option>
          <option value="COMPLETED">{t('consultation.status.completed')}</option>
          <option value="CANCELLED">{t('consultation.status.cancelled')}</option>
        </Select>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={isLoading}
        >
          {initialData ? t('consultationForm.submit.update') : t('consultationForm.submit.create')}
        </Button>
      </div>
    </form>
  );
}