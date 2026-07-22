-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "gradeBand" TEXT,
    "topic" TEXT,
    "appliedMethods" "Method"[] DEFAULT ARRAY[]::"Method"[],
    "creditedAuthor" TEXT,
    "worksheetUrl" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "fileMime" TEXT,
    "fileSizeBytes" INTEGER,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskUsage" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskRating" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_authorUserId_idx" ON "Task"("authorUserId");

-- CreateIndex
CREATE INDEX "TaskUsage_lessonPlanId_idx" ON "TaskUsage"("lessonPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskUsage_taskId_lessonPlanId_key" ON "TaskUsage"("taskId", "lessonPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskRating_taskId_userId_key" ON "TaskRating"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUsage" ADD CONSTRAINT "TaskUsage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUsage" ADD CONSTRAINT "TaskUsage_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRating" ADD CONSTRAINT "TaskRating_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRating" ADD CONSTRAINT "TaskRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

