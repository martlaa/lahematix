-- CreateEnum
CREATE TYPE "TestPhase" AS ENUM ('EEL', 'JAREL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvitePurpose" ADD VALUE 'TEST_EEL';
ALTER TYPE "InvitePurpose" ADD VALUE 'TEST_JAREL';

-- CreateTable
CREATE TABLE "TestSubmission" (
    "id" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "phase" "TestPhase" NOT NULL,
    "studentId" TEXT NOT NULL,
    "answersJson" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSubmissionPhoto" (
    "id" TEXT NOT NULL,
    "testSubmissionId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSubmissionPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestGrading" (
    "id" TEXT NOT NULL,
    "testSubmissionId" TEXT NOT NULL,
    "scoresJson" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "comment" TEXT,
    "gradedByUserId" TEXT NOT NULL,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestGrading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestSubmission_testCode_phase_studentId_key" ON "TestSubmission"("testCode", "phase", "studentId");

-- CreateIndex
CREATE INDEX "TestSubmissionPhoto_testSubmissionId_idx" ON "TestSubmissionPhoto"("testSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestGrading_testSubmissionId_key" ON "TestGrading"("testSubmissionId");

-- AddForeignKey
ALTER TABLE "TestSubmission" ADD CONSTRAINT "TestSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmissionPhoto" ADD CONSTRAINT "TestSubmissionPhoto_testSubmissionId_fkey" FOREIGN KEY ("testSubmissionId") REFERENCES "TestSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestGrading" ADD CONSTRAINT "TestGrading_testSubmissionId_fkey" FOREIGN KEY ("testSubmissionId") REFERENCES "TestSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestGrading" ADD CONSTRAINT "TestGrading_gradedByUserId_fkey" FOREIGN KEY ("gradedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

