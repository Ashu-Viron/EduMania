import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mockEstimates } from '../services/mockData'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

export default function EstimatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: estimates, isLoading } = useQuery({
    queryKey: ['estimates'],
    queryFn: () => Promise.resolve(mockEstimates),
  })

  const filteredEstimates = estimates?.filter((estimate) => {
    const matchesSearch = estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter
    return matchesSearch && matchesStatus
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
      hour: '2-digit',
      minute: '2-digit',
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
          <h1 className="text-2xl font-bold text-gray-900">받은 견적</h1>
          <p className="text-gray-600">클라이언트로부터 받은 프로젝트 견적을 관리하세요</p>
        </div>
        <Button variant="primary">
          <DocumentTextIcon className="mr-2 h-4 w-4" />
          새 견적 요청
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="견적 제목이나 클라이언트 이름으로 검색..."
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
              <option value="pending">대기중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Estimates List */}
      <div className="grid gap-6">
        {filteredEstimates?.map((estimate) => (
          <Card key={estimate.id} hover>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                    <strong className="text-gray-700">클라이언트:</strong>
                    <span className="ml-1">{estimate.clientName}</span>
                  </span>
                  <span className="flex items-center">
                    <strong className="text-gray-700">예상 기간:</strong>
                    <span className="ml-1">{estimate.estimatedDuration}</span>
                  </span>
                  <span className="flex items-center">
                    <strong className="text-gray-700">요청일:</strong>
                    <span className="ml-1">{formatDate(estimate.createdAt)}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col lg:items-end gap-2">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(estimate.amount)}
                </div>
                <div className="flex gap-2">
                  {estimate.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                      <Button variant="primary" size="sm">
                        승인
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

      {filteredEstimates?.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">견적이 없습니다</h3>
            <p className="mt-2 text-gray-600">
              검색 조건에 맞는 견적을 찾을 수 없습니다.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}