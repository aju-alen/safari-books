-- AlterTable
ALTER TABLE `Author` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Company` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;
