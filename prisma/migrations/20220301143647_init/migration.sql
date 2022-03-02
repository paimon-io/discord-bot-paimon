-- CreateTable
CREATE TABLE "Resins" (
    "userId" VARCHAR(255) NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Resins_pkey" PRIMARY KEY ("userId")
);