/*
  Warnings:

  - You are about to drop the `tracker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "tracker";

-- CreateTable
CREATE TABLE "Tracker" (
    "id" TEXT NOT NULL,
    "referrerId" INTEGER,
    "friendId" INTEGER,
    "discountCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tracker_pkey" PRIMARY KEY ("id")
);
