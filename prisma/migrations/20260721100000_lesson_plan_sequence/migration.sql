-- AlterTable
ALTER TABLE "LessonPlan" ADD COLUMN     "previousLessonPlanId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlan_previousLessonPlanId_key" ON "LessonPlan"("previousLessonPlanId");

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_previousLessonPlanId_fkey" FOREIGN KEY ("previousLessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

