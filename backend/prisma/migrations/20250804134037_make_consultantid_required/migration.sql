/*
  Warnings:

  - Made the column `consultantId` on table `consultations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "consultations" DROP CONSTRAINT "consultations_consultantId_fkey";

-- AlterTable
ALTER TABLE "consultations" ALTER COLUMN "consultantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "ConsultantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
