import { useForm } from 'react-hook-form'
import { Estimate } from '../types'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import { useTranslation } from 'react-i18next'
import Select from './ui/Select'

interface EstimateFormProps {
  initialData?: Estimate
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading: boolean
  isEdit?: boolean
}

export default function EstimateForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}: EstimateFormProps) {
  const { t } = useTranslation()

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      clientName: '',
      clientEmail: '',
      amount: 0,
      estimatedDuration: '',
      status: 'PENDING'
    }
  })
  const currentStatus = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('estimateForm.title')}
        {...register('title', { required: t('estimateForm.required') })}
        error={errors.title?.message as string}
      />

      <Textarea
        label={t('estimateForm.description')}
        {...register('description', { required: t('estimateForm.required') })}
        error={errors.description?.message as string}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('estimateForm.clientName')}
          {...register('clientName', { required: t('estimateForm.required') })}
          error={errors.clientName?.message as string}
        />

        <Input
          label={t('estimateForm.clientEmail')}
          type="email"
          {...register('clientEmail', {
            required: t('estimateForm.required'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('estimateForm.invalidEmail')
            }
          })}
          error={errors.clientEmail?.message as string}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('estimateForm.amount')}
          type="number"
          {...register('amount', {
            required: t('estimateForm.required'),
            min: {
              value: 1,
              message: t('estimateForm.minAmount')
            }
          })}
          error={errors.amount?.message as string}
        />

        <Input
          label={t('estimateForm.duration')}
          {...register('estimatedDuration', { required: t('estimateForm.required') })}
          error={errors.estimatedDuration?.message as string}
        />
      </div>
      {isEdit && (
        <div>
          <Select
            label={t('estimateForm.status')}
            {...register('status', { required: t('estimateForm.required') })}
            error={errors.status?.message as string}
          >
            <option value="PENDING">{t('estimate.status.pending')}</option>
            <option value="APPROVED">{t('estimate.status.approved')}</option>
            <option value="REJECTED">{t('estimate.status.rejected')}</option>
          </Select>
          
          {initialData?.status !== currentStatus && (
            <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 text-sm rounded-md">
              {t('estimateForm.statusChangeWarning')}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {isEdit ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  )
}