-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CONSULTANT');

-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "consultantId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "ConsultantProfile" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hourlyRate" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ConsultantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantProfile_userId_key" ON "ConsultantProfile"("userId");

-- AddForeignKey
ALTER TABLE "ConsultantProfile" ADD CONSTRAINT "ConsultantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "ConsultantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
