import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for the user
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed User
  const user = await prisma.user.create({
    data: {
      id: 'user_1',
      email: 'new@example.com',
      password: hashedPassword,
      name: '김철수',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-15T00:00:00Z'),
    },
  });

  // Seed Estimates
  await prisma.estimate.createMany({
    data: [
      {
        id: 'estimate_1',
        title: '웹사이트 리뉴얼 프로젝트',
        description: '기존 웹사이트의 전면적인 리뉴얼 작업입니다. 반응형 디자인과 최신 기술 스택을 적용하여 사용자 경험을 개선합니다.',
        status: 'PENDING',
        amount: 5000000,
        estimatedDuration: '4주',
        clientName: '(주)테크솔루션',
        clientEmail: 'contact@techsolution.com',
        userId: user.id,
        createdAt: new Date('2024-01-10T09:00:00Z'),
        updatedAt: new Date('2024-01-10T09:00:00Z'),
      },
      {
        id: 'estimate_2',
        title: '모바일 앱 개발',
        description: 'iOS와 Android용 크로스플랫폼 모바일 애플리케이션 개발 프로젝트입니다.',
        status: 'APPROVED',
        amount: 8000000,
        estimatedDuration: '8주',
        clientName: '스타트업 ABC',
        clientEmail: 'ceo@startupABC.com',
        userId: user.id,
        createdAt: new Date('2024-01-08T14:30:00Z'),
        updatedAt: new Date('2024-01-12T16:45:00Z'),
      },
      {
        id: 'estimate_3',
        title: 'E-커머스 플랫폼 구축',
        description: '온라인 쇼핑몰 플랫폼 구축 및 결제 시스템 연동 작업입니다.',
        status: 'PENDING',
        amount: 12000000,
        estimatedDuration: '12주',
        clientName: '온라인마켓',
        clientEmail: 'dev@onlinemarket.co.kr',
        userId: user.id,
        createdAt: new Date('2024-01-15T11:15:00Z'),
        updatedAt: new Date('2024-01-15T11:15:00Z'),
      },
      {
        id: 'estimate_4',
        title: '데이터 분석 대시보드',
        description: '실시간 데이터 시각화 및 분석 대시보드 개발 프로젝트입니다.',
        status: 'REJECTED',
        amount: 3500000,
        estimatedDuration: '6주',
        clientName: '데이터텍',
        clientEmail: 'project@datatech.com',
        userId: user.id,
        createdAt: new Date('2024-01-05T13:20:00Z'),
        updatedAt: new Date('2024-01-07T10:30:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  // Seed Consultations
  await prisma.consultation.createMany({
    data: [
      {
        id: 'consult_1',
        title: '프로젝트 초기 상담',
        description: '웹사이트 리뉴얼 프로젝트에 대한 초기 요구사항 논의 및 기술 스택 검토',
        status: 'COMPLETED',
        consultantName: '이영희 컨설턴트',
        scheduledAt: new Date('2024-01-09T10:00:00Z'),
        duration: 60,
        notes: '클라이언트의 요구사항을 명확히 파악했으며, React와 Node.js 기반의 기술 스택으로 진행하기로 결정했습니다.',
        userId: user.id,
        createdAt: new Date('2024-01-08T09:00:00Z'),
        updatedAt: new Date('2024-01-09T11:00:00Z'),
      },
      {
        id: 'consult_2',
        title: '모바일 앱 기획 상담',
        description: 'iOS/Android 앱 개발을 위한 기획 단계 상담 및 UX/UI 검토',
        status: 'SCHEDULED',
        consultantName: '박민수 컨설턴트',
        scheduledAt: new Date('2024-01-20T14:00:00Z'),
        duration: 90,
        userId: user.id,
        createdAt: new Date('2024-01-15T16:30:00Z'),
        updatedAt: new Date('2024-01-15T16:30:00Z'),
      },
      {
        id: 'consult_3',
        title: '기술 아키텍처 리뷰',
        description: 'E-커머스 플랫폼의 기술 아키텍처 및 확장성에 대한 전문가 리뷰',
        status: 'COMPLETED',
        consultantName: '최기술 시니어 컨설턴트',
        scheduledAt: new Date('2024-01-16T15:30:00Z'),
        duration: 120,
        notes: '마이크로서비스 아키텍처 도입을 권장하며, 단계적 마이그레이션 계획을 수립했습니다.',
        userId: user.id,
        createdAt: new Date('2024-01-14T10:00:00Z'),
        updatedAt: new Date('2024-01-16T17:30:00Z'),
      },
      {
        id: 'consult_4',
        title: '프로젝트 킥오프 미팅',
        description: '승인된 프로젝트의 킥오프 미팅 및 개발 일정 협의',
        status: 'CANCELLED',
        consultantName: '김프로 프로젝트 매니저',
        scheduledAt: new Date('2024-01-18T09:00:00Z'),
        duration: 45,
        notes: '클라이언트 사정으로 인해 연기되었습니다.',
        userId: user.id,
        createdAt: new Date('2024-01-12T14:00:00Z'),
        updatedAt: new Date('2024-01-17T18:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });