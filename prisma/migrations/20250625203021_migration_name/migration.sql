-- CreateTable
CREATE TABLE `artwork` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `art_name` VARCHAR(191) NOT NULL,
    `start_price` INTEGER NOT NULL,
    `bid_rate` INTEGER NOT NULL,
    `fee` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `end_at` DATETIME(3) NOT NULL,
    `start_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
