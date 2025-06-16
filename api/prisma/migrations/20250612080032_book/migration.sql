/*
  Warnings:

  - Added the required column `categories` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Book` ADD COLUMN `categories` ENUM('biographiesmemoirs') NOT NULL,
    MODIFY `colorCode` VARCHAR(191) NULL,
    MODIFY `rating` INTEGER NOT NULL DEFAULT 0;
