/*
  Warnings:

  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Reward";

-- CreateTable
CREATE TABLE "reward" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "minOrderAmount" DOUBLE PRECISION NOT NULL,
    "minOrderQuantity" DOUBLE PRECISION NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);
