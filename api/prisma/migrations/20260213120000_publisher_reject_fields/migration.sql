-- AlterTable
ALTER TABLE `Company`
    ADD COLUMN `isRejected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reject` LONGTEXT NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Author`
    ADD COLUMN `isRejected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reject` LONGTEXT NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL;
