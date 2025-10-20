/*
  Warnings:

  - You are about to drop the column `narrationStyleCasual` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleFast` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleIntimate` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleOratoric` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleSlow` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleStatic` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrator` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleCasual` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleFast` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleIntimate` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleOratoric` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleSlow` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `narrationStyleStatic` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `narrator` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Author` DROP COLUMN `narrationStyleCasual`,
    DROP COLUMN `narrationStyleFast`,
    DROP COLUMN `narrationStyleIntimate`,
    DROP COLUMN `narrationStyleOratoric`,
    DROP COLUMN `narrationStyleSlow`,
    DROP COLUMN `narrationStyleStatic`,
    DROP COLUMN `narrator`,
    ADD COLUMN `isRegistrationComplete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `narrationGender` VARCHAR(191) NULL,
    ADD COLUMN `narrationLanguageCode` VARCHAR(191) NULL,
    ADD COLUMN `narrationSampleHeartzRate` VARCHAR(191) NULL,
    ADD COLUMN `narrationSpeakingRate` VARCHAR(191) NULL,
    ADD COLUMN `narrationVoiceName` VARCHAR(191) NULL,
    ADD COLUMN `registrationStartedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Company` DROP COLUMN `narrationStyleCasual`,
    DROP COLUMN `narrationStyleFast`,
    DROP COLUMN `narrationStyleIntimate`,
    DROP COLUMN `narrationStyleOratoric`,
    DROP COLUMN `narrationStyleSlow`,
    DROP COLUMN `narrationStyleStatic`,
    DROP COLUMN `narrator`,
    ADD COLUMN `isRegistrationComplete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `narrationGender` VARCHAR(191) NULL,
    ADD COLUMN `narrationLanguageCode` VARCHAR(191) NULL,
    ADD COLUMN `narrationSampleHeartzRate` VARCHAR(191) NULL,
    ADD COLUMN `narrationSpeakingRate` VARCHAR(191) NULL,
    ADD COLUMN `narrationVoiceName` VARCHAR(191) NULL,
    ADD COLUMN `registrationStartedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
