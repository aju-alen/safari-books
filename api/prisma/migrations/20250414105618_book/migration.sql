-- AlterTable
ALTER TABLE `Book` ADD COLUMN `authorId` VARCHAR(191) NULL,
    ADD COLUMN `companyId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book` ADD CONSTRAINT `Book_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `Author`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
