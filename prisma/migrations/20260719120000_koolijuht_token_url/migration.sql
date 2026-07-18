-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_directorId_fkey";

-- DropIndex
DROP INDEX "School_directorId_key";

-- AlterTable
ALTER TABLE "InviteToken" ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "directorId",
ADD COLUMN     "directorEmail" TEXT,
ADD COLUMN     "directorName" TEXT;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

