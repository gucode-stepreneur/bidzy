/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fbId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `fbId` VARCHAR(191) NULL,
    ADD COLUMN `fbLink` VARCHAR(191) NULL,
    ADD COLUMN `phone` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_phone_key` ON `user`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `user_fbId_key` ON `user`(`fbId`);
