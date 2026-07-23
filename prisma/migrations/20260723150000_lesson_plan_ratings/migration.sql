-- CreateTable
CREATE TABLE "LessonPlanRating" (
    "id" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPlanRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleLessonPlanRating" (
    "id" TEXT NOT NULL,
    "sampleLessonPlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleLessonPlanRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonPlanRating_lessonPlanId_userId_key" ON "LessonPlanRating"("lessonPlanId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleLessonPlanRating_sampleLessonPlanId_userId_key" ON "SampleLessonPlanRating"("sampleLessonPlanId", "userId");

-- AddForeignKey
ALTER TABLE "LessonPlanRating" ADD CONSTRAINT "LessonPlanRating_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanRating" ADD CONSTRAINT "LessonPlanRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleLessonPlanRating" ADD CONSTRAINT "SampleLessonPlanRating_sampleLessonPlanId_fkey" FOREIGN KEY ("sampleLessonPlanId") REFERENCES "SampleLessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleLessonPlanRating" ADD CONSTRAINT "SampleLessonPlanRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

