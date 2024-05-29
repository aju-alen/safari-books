-- CreateTable
CREATE TABLE `Book` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `durationInHours` INTEGER NOT NULL,
    `durationInMinutes` INTEGER NOT NULL,
    `coverImage` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `narratorName` VARCHAR(191) NOT NULL,
    `Summary` LONGTEXT NOT NULL,
    `ReleaseDate` DATETIME(3) NOT NULL,
    `Language` VARCHAR(191) NOT NULL,
    `Publisher` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
