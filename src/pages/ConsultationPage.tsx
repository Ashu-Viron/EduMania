import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mockConsultations } from '../services/mockData'
// import { Consultation } from '../types';
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function ConsultationPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => Promise.resolve(mockConsultations),
  })

  //new
  // const { 
  //   data: consultations, 
  //   isLoading, 
  //   isError,
  //   error 
  // } = useQuery<Consultation[], Error>({
  //   queryKey: ['consultations'],
  //   queryFn: consultationsAPI.getAll,
  //   staleTime: 5 * 60 * 1000,
  //   retry: 2,
  // });
  //

  const filteredConsultations = consultations?.filter((consultation) => {
    const matchesSearch = consultation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.consultantName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  //  const filteredConsultations = consultations?.filter((consultation) => {
  //   const matchesSearch = consultation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        consultation.consultantName.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
  //   return matchesSearch && matchesStatus;
  // });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상담내역</h1>
          <p className="text-gray-600">진행했거나 예정된 상담을 확인하고 관리하세요</p>
        </div>
        <Button variant="primary">
          <CalendarIcon className="mr-2 h-4 w-4" />
          새 상담 예약
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="상담 제목이나 컨설턴트 이름으로 검색..."
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">모든 상태</option>
              <option value="scheduled">예정됨</option>
              <option value="completed">완료됨</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Consultations List */}
      <div className="grid gap-6">
        {filteredConsultations?.map((consultation) => (
          <Card key={consultation.id} hover>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
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
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <strong className="text-gray-700">컨설턴트:</strong>
                    <span className="ml-1">{consultation.consultantName}</span>
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(consultation.scheduledAt)}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {consultation.duration}분
                  </span>
                </div>
                {consultation.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>메모:</strong> {consultation.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col lg:items-end gap-2">
                <div className="flex gap-2">
                  {consultation.status === 'scheduled' && (
                    <>
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                      <Button variant="error" size="sm">
                        취소
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    자세히 보기
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredConsultations?.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">상담 내역이 없습니다</h3>
            <p className="mt-2 text-gray-600">
              검색 조건에 맞는 상담을 찾을 수 없습니다.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}