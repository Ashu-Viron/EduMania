/*
  Warnings:

  - You are about to drop the column `consultantAvatar` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `consultantName` on the `consultations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "consultations" DROP COLUMN "consultantAvatar",
DROP COLUMN "consultantName";
