/*
  Warnings:

  - You are about to drop the `Tracker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Tracker";

-- CreateTable
CREATE TABLE "tracker" (
    "id" TEXT NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "discountCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_pkey" PRIMARY KEY ("id")
);
