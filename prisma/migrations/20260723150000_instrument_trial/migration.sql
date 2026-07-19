-- CreateTable
CREATE TABLE "InstrumentTrial" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "instrumentCode" TEXT NOT NULL,
    "answersJson" TEXT,
    "gradingJson" TEXT,
    "totalScore" INTEGER,
    "gradingComment" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstrumentTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentTrial_authorUserId_instrumentCode_key" ON "InstrumentTrial"("authorUserId", "instrumentCode");

-- AddForeignKey
ALTER TABLE "InstrumentTrial" ADD CONSTRAINT "InstrumentTrial_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

