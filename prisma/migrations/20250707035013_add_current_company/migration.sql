/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentCompanyId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentCompanyId_fkey" FOREIGN KEY ("currentCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
