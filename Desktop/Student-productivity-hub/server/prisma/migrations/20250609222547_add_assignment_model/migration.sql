/*
  Warnings:

  - You are about to drop the column `progress` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Assignment` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "progress",
DROP COLUMN "subject",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
