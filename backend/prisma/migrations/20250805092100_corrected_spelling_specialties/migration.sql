/*
  Warnings:

  - You are about to drop the column `specialities` on the `ConsultantProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConsultantProfile" DROP COLUMN "specialties",
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[];
