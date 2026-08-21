CREATE DATABASE IF NOT EXISTS `yomiage` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `yomiage`;

-- ユーザーごとの音声設定テーブル
CREATE TABLE IF NOT EXISTS `user_settings` (
  `guild_id` VARCHAR(32) NOT NULL,
  `user_id` VARCHAR(32) NOT NULL,
  `speaker` INT NOT NULL DEFAULT 3,
  `speed_scale` FLOAT NOT NULL DEFAULT 1.0,
  `pitch_scale` FLOAT NOT NULL DEFAULT 0.0,
  `intonation_scale` FLOAT NOT NULL DEFAULT 1.0,
  `volume_scale` FLOAT NOT NULL DEFAULT 1.0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`guild_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- サーバーごとのカスタム辞書テーブル
CREATE TABLE IF NOT EXISTS `guild_dictionary` (
  `guild_id` VARCHAR(32) NOT NULL,
  `source` VARCHAR(100) NOT NULL,
  `reading` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`guild_id`, `source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;