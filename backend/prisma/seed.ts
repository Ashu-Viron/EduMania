import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.consultantProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned up the database.');

  // Create a regular user
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: '홍길동',
      avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      role: UserRole.USER,
      phone: '010-1234-5678', // NEW: Added phone
      company: 'Tech Solutions Inc.', // NEW: Added company
    },
  });

  // Create a consultant user and their profile
  const consultantUser1 = await prisma.user.create({
    data: {
      email: 'consultant1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: '이영희 컨설턴트',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      role: UserRole.CONSULTANT,
    },
  });
  const consultantProfile1 = await prisma.consultantProfile.create({
    data: {
      userId: consultantUser1.id,
      bio: 'UI/UX 디자인 및 프론트엔드 개발 전문 컨설턴트입니다.',
      specialties: ['UI/UX Design', 'Frontend Development'],
      hourlyRate: 150000,
      isAvailable: true,
    },
  });

  // Create more consultants as needed
  const consultantUser2 = await prisma.user.create({
    data: {
      email: 'consultant2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: '박민수 컨설턴트',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
      role: UserRole.CONSULTANT,
    },
  });
  const consultantProfile2 = await prisma.consultantProfile.create({
    data: {
      userId: consultantUser2.id,
      bio: '백엔드 아키텍처 및 데이터베이스 최적화 전문입니다.',
      specialties: ['Backend Architecture', 'Database Optimization'],
      hourlyRate: 180000,
      isAvailable: true,
    },
  });

  console.log('Created users and consultants.');

  // Create some estimates for user1
  await prisma.estimate.createMany({
    data: [
      {
        userId: user1.id,
        title: '신규 웹사이트 개발 견적',
        description: '반응형 웹사이트 개발을 위한 견적입니다.',
        status: 'PENDING',
        amount: 5000000,
        estimatedDuration: '4주',
        clientName: '김철수',
        clientEmail: 'chulsoo.kim@example.com',
      },
      {
        userId: user1.id,
        title: '모바일 앱 UI/UX 디자인 견적',
        description: 'iOS/Android 앱 디자인을 위한 견적입니다.',
        status: 'APPROVED',
        amount: 3500000,
        estimatedDuration: '2주',
        clientName: '김철수',
        clientEmail: 'chulsoo.kim@example.com',
      },
      {
        userId: user1.id,
        title: '서버 아키텍처 설계 견적',
        description: '클라우드 기반 서버 설계 컨설팅 견적입니다.',
        status: 'REJECTED',
        amount: 7000000,
        estimatedDuration: '3주',
        clientName: '김철수',
        clientEmail: 'chulsoo.kim@example.com',
      },
    ],
  });

  // Create some consultations for user1 and consultant1
  await prisma.consultation.createMany({
    data: [
      {
        userId: user1.id,
        consultantId: consultantProfile1.id,
        title: '프로젝트 초기 컨설팅',
        description: '새로운 프로젝트의 방향성을 논의하는 자리입니다.',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        duration: 60,
        notes: '클라이언트가 UI/UX에 관심이 많음.',
      },
      {
        userId: user1.id,
        consultantId: consultantProfile2.id,
        title: '데이터베이스 설계 검토',
        description: '기존 데이터베이스 설계의 성능 개선 방안을 찾습니다.',
        status: 'COMPLETED',
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        duration: 90,
        notes: 'NoSQL 도입을 제안함.',
      },
      {
        userId: user1.id,
        consultantId: consultantProfile1.id,
        title: '최근 UX 트렌드 분석',
        description: '최신 UX 트렌드에 대한 컨설팅 요청입니다.',
        status: 'COMPLETED',
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        duration: 45,
        notes: '피드백이 좋았음.',
      },
    ],
  });

  // Create some notifications for user1
  await prisma.notification.createMany({
    data: [
      { userId: user1.id, title: 'Your estimate for "New Website" has been approved.', read: false },
      { userId: user1.id, title: 'Consultation with Consultant Jane is scheduled for tomorrow.', read: false },
      { userId: user1.id, title: 'Welcome to the platform! Enjoy your experience.', read: true },
    ],
  });

  // Create some notifications for consultant1
  await prisma.notification.createMany({
    data: [
      { userId: consultantUser1.id, title: 'New consultation request from Hong Gil Dong.', read: false },
      { userId: consultantUser1.id, title: 'You have a consultation with Hong Gil Dong next week.', read: true },
    ],
  });

  console.log('Seeded the database.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });