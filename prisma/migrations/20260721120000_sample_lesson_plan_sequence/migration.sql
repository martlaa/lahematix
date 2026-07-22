-- AlterTable
ALTER TABLE "SampleLessonPlan" ADD COLUMN     "previousSampleLessonPlanId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SampleLessonPlan_previousSampleLessonPlanId_key" ON "SampleLessonPlan"("previousSampleLessonPlanId");

-- AddForeignKey
ALTER TABLE "SampleLessonPlan" ADD CONSTRAINT "SampleLessonPlan_previousSampleLessonPlanId_fkey" FOREIGN KEY ("previousSampleLessonPlanId") REFERENCES "SampleLessonPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

