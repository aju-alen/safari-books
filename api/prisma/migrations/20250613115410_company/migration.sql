/*
  Warnings:

  - You are about to alter the column `categories` on the `Author` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `categories` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `Author` MODIFY `categories` ENUM('biographiesmemoirs', 'fiction', 'nonfiction', 'biography', 'selfhelp', 'history', 'fantasy', 'science', 'romance', 'thriller', 'mystery', 'poetry', 'children', 'youngadult', 'health', 'religion', 'business', 'education', 'travel') NULL;

-- AlterTable
ALTER TABLE `Company` MODIFY `categories` ENUM('biographiesmemoirs', 'fiction', 'nonfiction', 'biography', 'selfhelp', 'history', 'fantasy', 'science', 'romance', 'thriller', 'mystery', 'poetry', 'children', 'youngadult', 'health', 'religion', 'business', 'education', 'travel') NULL;
