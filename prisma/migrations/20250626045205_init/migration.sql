-- CreateTable
CREATE TABLE `bidHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bid_amount` INTEGER NOT NULL,
    `bidder_name` VARCHAR(191) NOT NULL,
    `bid_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_artwork` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
