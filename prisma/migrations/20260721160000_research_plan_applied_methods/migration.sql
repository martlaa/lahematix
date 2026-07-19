-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ResearchPlanEntry" ADD COLUMN     "appliedMethods" "Method"[] DEFAULT ARRAY[]::"Method"[];

