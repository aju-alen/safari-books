-- CreateTable
CREATE TABLE `Author` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `idppNo` VARCHAR(191) NOT NULL,
    `idppPdfUrl` VARCHAR(191) NOT NULL,
    `kraPin` VARCHAR(191) NOT NULL,
    `kraPinPdfUrl` VARCHAR(191) NOT NULL,
    `writersGuildNo` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `categories` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `ISBNDOIISRC` VARCHAR(191) NULL,
    `synopsis` LONGTEXT NULL,
    `narrator` VARCHAR(191) NULL,
    `narrationStyleSlow` BOOLEAN NULL,
    `narrationStyleFast` BOOLEAN NULL,
    `narrationStyleIntimate` BOOLEAN NULL,
    `narrationStyleCasual` BOOLEAN NULL,
    `narrationStyleStatic` BOOLEAN NULL,
    `narrationStyleOratoric` BOOLEAN NULL,
    `audioSampleURL` VARCHAR(191) NULL,
    `pdfURL` VARCHAR(191) NULL,
    `rightsHolder` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Author` ADD CONSTRAINT `Author_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
