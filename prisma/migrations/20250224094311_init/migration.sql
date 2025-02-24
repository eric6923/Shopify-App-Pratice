-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('REFERRER', 'FRIEND');

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "minOrder" DOUBLE PRECISION NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);
