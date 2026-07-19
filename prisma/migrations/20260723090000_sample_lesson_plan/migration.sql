-- CreateTable
CREATE TABLE "SampleLessonPlan" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "gradeBand" TEXT,
    "appliedMethods" "Method"[] DEFAULT ARRAY[]::"Method"[],
    "topic" TEXT,
    "durationMin" INTEGER,
    "materialsJson" TEXT,
    "homeworkText" TEXT,
    "homeworkRelated" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleLessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleLessonPlanPart" (
    "id" TEXT NOT NULL,
    "sampleLessonPlanId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LessonPartType" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "SampleLessonPlanPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SampleLessonPlan_authorUserId_idx" ON "SampleLessonPlan"("authorUserId");

-- CreateIndex
CREATE INDEX "SampleLessonPlanPart_sampleLessonPlanId_idx" ON "SampleLessonPlanPart"("sampleLessonPlanId");

-- AddForeignKey
ALTER TABLE "SampleLessonPlan" ADD CONSTRAINT "SampleLessonPlan_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleLessonPlanPart" ADD CONSTRAINT "SampleLessonPlanPart_sampleLessonPlanId_fkey" FOREIGN KEY ("sampleLessonPlanId") REFERENCES "SampleLessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

