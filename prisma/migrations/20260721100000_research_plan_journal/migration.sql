-- CreateTable
CREATE TABLE "ResearchPlanEntry" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "durationMin" INTEGER,
    "studentGroup" TEXT,
    "topic" TEXT,
    "lessonPlanUrl" TEXT,
    "expectingObserver" BOOLEAN NOT NULL DEFAULT false,
    "observerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "researchPlanEntryId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "answersJson" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchPlanEntry_teacherId_idx" ON "ResearchPlanEntry"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_researchPlanEntryId_key" ON "JournalEntry"("researchPlanEntryId");

-- AddForeignKey
ALTER TABLE "ResearchPlanEntry" ADD CONSTRAINT "ResearchPlanEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_researchPlanEntryId_fkey" FOREIGN KEY ("researchPlanEntryId") REFERENCES "ResearchPlanEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

