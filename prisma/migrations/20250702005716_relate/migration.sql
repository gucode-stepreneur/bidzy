-- AddForeignKey
ALTER TABLE `bidHistory` ADD CONSTRAINT `bidHistory_id_artwork_fkey` FOREIGN KEY (`id_artwork`) REFERENCES `artwork`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
