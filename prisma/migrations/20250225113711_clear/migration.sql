/*
  Warnings:

  - Added the required column `discountType` to the `reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reward" ADD COLUMN     "discountType" TEXT NOT NULL;
