/*
  Warnings:

  - The `status` column on the `member` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVED', 'PENDING', 'REJECT', 'DISABLE');

-- AlterTable
ALTER TABLE "member" DROP COLUMN "status",
ADD COLUMN     "status" "Status" DEFAULT 'PENDING';
