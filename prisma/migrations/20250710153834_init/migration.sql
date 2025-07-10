/*
  Warnings:

  - You are about to drop the column `fbId` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_fbId_key` ON `user`;

-- AlterTable
ALTER TABLE `artwork` ADD COLUMN `notified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `fbId`;
