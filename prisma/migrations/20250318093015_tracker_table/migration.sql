-- CreateTable
CREATE TABLE "Tracker" (
    "id" TEXT NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "discountCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tracker_pkey" PRIMARY KEY ("id")
);
