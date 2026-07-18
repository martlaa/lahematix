-- CreateEnum
CREATE TYPE "InvitePurpose" AS ENUM ('CONSENT', 'QUESTIONNAIRE_EEL', 'QUESTIONNAIRE_JAREL');

-- AlterTable
ALTER TABLE "InviteToken" ADD COLUMN     "purpose" "InvitePurpose" NOT NULL DEFAULT 'CONSENT';

-- CreateTable
CREATE TABLE "QuestionnaireResponse" (
    "id" TEXT NOT NULL,
    "questionnaireCode" TEXT NOT NULL,
    "studentId" TEXT,
    "teacherUserId" TEXT,
    "answersJson" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireResponse_questionnaireCode_studentId_key" ON "QuestionnaireResponse"("questionnaireCode", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireResponse_questionnaireCode_teacherUserId_key" ON "QuestionnaireResponse"("questionnaireCode", "teacherUserId");

-- AddForeignKey
ALTER TABLE "QuestionnaireResponse" ADD CONSTRAINT "QuestionnaireResponse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireResponse" ADD CONSTRAINT "QuestionnaireResponse_teacherUserId_fkey" FOREIGN KEY ("teacherUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

