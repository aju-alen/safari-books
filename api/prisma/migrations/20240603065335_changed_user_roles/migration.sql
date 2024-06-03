/*
  Warnings:

  - You are about to drop the column `Language` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `Publisher` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `ReleaseDate` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `Summary` on the `Book` table. All the data in the column will be lost.
  - The values [AUTHOR] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `colorCode` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publisher` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseDate` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Book` DROP COLUMN `Language`,
    DROP COLUMN `Publisher`,
    DROP COLUMN `ReleaseDate`,
    DROP COLUMN `Summary`,
    ADD COLUMN `colorCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `language` VARCHAR(191) NOT NULL,
    ADD COLUMN `publisher` VARCHAR(191) NOT NULL,
    ADD COLUMN `rating` INTEGER NOT NULL,
    ADD COLUMN `releaseDate` DATETIME(3) NOT NULL,
    ADD COLUMN `summary` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('LISTENER', 'NARRATOR', 'ADMIN', 'PUBLISHER') NOT NULL;
