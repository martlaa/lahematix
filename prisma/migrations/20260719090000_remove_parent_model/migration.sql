-- DropForeignKey
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_userId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_parentId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "parentId",
ADD COLUMN     "parentEmail" TEXT,
ADD COLUMN     "parentName" TEXT;

-- DropTable
DROP TABLE "Parent";

