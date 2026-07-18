-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "classCode" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

