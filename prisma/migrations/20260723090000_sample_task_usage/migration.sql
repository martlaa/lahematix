-- CreateTable
CREATE TABLE "SampleTaskUsage" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "sampleLessonPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SampleTaskUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SampleTaskUsage_sampleLessonPlanId_idx" ON "SampleTaskUsage"("sampleLessonPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleTaskUsage_taskId_sampleLessonPlanId_key" ON "SampleTaskUsage"("taskId", "sampleLessonPlanId");

-- AddForeignKey
ALTER TABLE "SampleTaskUsage" ADD CONSTRAINT "SampleTaskUsage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleTaskUsage" ADD CONSTRAINT "SampleTaskUsage_sampleLessonPlanId_fkey" FOREIGN KEY ("sampleLessonPlanId") REFERENCES "SampleLessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

