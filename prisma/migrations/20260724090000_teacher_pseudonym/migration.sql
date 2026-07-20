-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "pseudonymCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_pseudonymCode_key" ON "Teacher"("pseudonymCode");

