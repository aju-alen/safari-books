-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `companyRegNo` VARCHAR(191) NOT NULL,
    `kraPin` VARCHAR(191) NOT NULL,
    `companyRegNoPdfUrl` VARCHAR(191) NOT NULL,
    `kraPinPdfUrl` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `categories` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `ISBNDOIISRC` VARCHAR(191) NULL,
    `synopsis` VARCHAR(191) NULL,
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
