/*
  Warnings:

  - You are about to drop the column `minOrder` on the `Discount` table. All the data in the column will be lost.
  - Added the required column `minOrderAmount` to the `Discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minOrderQuantity` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "minOrder",
ADD COLUMN     "minOrderAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minOrderQuantity" DOUBLE PRECISION NOT NULL;
