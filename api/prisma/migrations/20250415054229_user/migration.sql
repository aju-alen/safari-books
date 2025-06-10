/*
  Warnings:

  - You are about to drop the column `userId` on the `Book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Book` DROP FOREIGN KEY `Book_userId_fkey`;

-- AlterTable
ALTER TABLE `Book` DROP COLUMN `userId`;
