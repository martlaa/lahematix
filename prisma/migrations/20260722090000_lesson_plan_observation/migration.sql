-- CreateEnum
CREATE TYPE "LessonPartType" AS ENUM ('OPETAJA_ESITLUS', 'INDIVIDUAALNE_HARJUTAMINE', 'INDIVIDUAALNE_PROBLEEMILAHENDUS', 'PROBLEEMILAHENDUS_RUHMATOONA', 'UHINE_ARUTELU', 'REFLEKSIOON');

-- CreateEnum
CREATE TYPE "CommentTiming" AS ENUM ('ENNE', 'JAREL');

-- AlterTable
ALTER TABLE "ResearchPlanEntry" DROP COLUMN "lessonPlanUrl",
ADD COLUMN     "observerUserId" TEXT;

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "researchPlanEntryId" TEXT NOT NULL,
    "materialsJson" TEXT,
    "homeworkText" TEXT,
    "homeworkRelated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlanPart" (
    "id" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LessonPartType" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "description" TEXT,
    "observerNote" TEXT,

    CONSTRAINT "LessonPlanPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlanComment" (
    "id" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "timing" "CommentTiming" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPlanComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservationProtocol" (
    "id" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "observerUserId" TEXT NOT NULL,
    "ratingsJson" TEXT,
    "incidentsJson" TEXT,
    "summaryJson" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservationProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlan_researchPlanEntryId_key" ON "LessonPlan"("researchPlanEntryId");

-- CreateIndex
CREATE INDEX "LessonPlanPart_lessonPlanId_idx" ON "LessonPlanPart"("lessonPlanId");

-- CreateIndex
CREATE INDEX "LessonPlanComment_lessonPlanId_idx" ON "LessonPlanComment"("lessonPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "ObservationProtocol_lessonPlanId_observerUserId_key" ON "ObservationProtocol"("lessonPlanId", "observerUserId");

-- CreateIndex
CREATE INDEX "ResearchPlanEntry_observerUserId_idx" ON "ResearchPlanEntry"("observerUserId");

-- AddForeignKey
ALTER TABLE "ResearchPlanEntry" ADD CONSTRAINT "ResearchPlanEntry_observerUserId_fkey" FOREIGN KEY ("observerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_researchPlanEntryId_fkey" FOREIGN KEY ("researchPlanEntryId") REFERENCES "ResearchPlanEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanPart" ADD CONSTRAINT "LessonPlanPart_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanComment" ADD CONSTRAINT "LessonPlanComment_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanComment" ADD CONSTRAINT "LessonPlanComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationProtocol" ADD CONSTRAINT "ObservationProtocol_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationProtocol" ADD CONSTRAINT "ObservationProtocol_observerUserId_fkey" FOREIGN KEY ("observerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

