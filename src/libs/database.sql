-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema oppa
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema oppa
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `oppa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `oppa` ;

-- -----------------------------------------------------
-- Table `oppa`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(45) NOT NULL,
  `lastname` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `rut` VARCHAR(45) NOT NULL,
  `password` TEXT NOT NULL,
  `gender` VARCHAR(45) NOT NULL,
  `img_url` TEXT NOT NULL,
  `state` VARCHAR(45) NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  `create_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `rut_UNIQUE` (`rut` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`adresses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`adresses` (
  `address_id` INT NOT NULL AUTO_INCREMENT,
  `lat` FLOAT NOT NULL,
  `lon` FLOAT NOT NULL,
  `street` VARCHAR(100) NOT NULL,
  `number` INT NOT NULL,
  `detail` VARCHAR(100) NOT NULL,
  `region` VARCHAR(45) NOT NULL,
  `district` VARCHAR(45) NOT NULL,
  `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `users_user_id` INT NOT NULL,
  `users_companions_companion_id` INT NOT NULL,
  `users_admins_admin_id` INT NOT NULL,
  `users_providers_provider_id` INT NOT NULL,
  PRIMARY KEY (`address_id`),
  UNIQUE INDEX `adresse_id_UNIQUE` (`address_id` ASC) VISIBLE,
  INDEX `fk_adresses_users1_idx` (`users_user_id` ASC, `users_companions_companion_id` ASC, `users_admins_admin_id` ASC, `users_providers_provider_id` ASC) VISIBLE,
  CONSTRAINT `fk_adresses_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `oppa`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`providers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`providers` (
  `provider_id` INT NOT NULL AUTO_INCREMENT,
  `rank` DECIMAL(5,0) NULL,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`provider_id`),
  UNIQUE INDEX `provider_id_UNIQUE` (`provider_id` ASC) VISIBLE,
  INDEX `fk_providers_users1_idx` (`users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_providers_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `oppa`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`companions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`companions` (
  `companion_id` INT NOT NULL AUTO_INCREMENT,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`companion_id`),
  UNIQUE INDEX `companion_id_UNIQUE` (`companion_id` ASC) VISIBLE,
  INDEX `fk_companions_users1_idx` (`users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_companions_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `oppa`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`elders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`elders` (
  `elder_id` INT NOT NULL AUTO_INCREMENT,
  `users_user_id` INT NOT NULL,
  `companions_companion_id` INT NOT NULL,
  PRIMARY KEY (`elder_id`),
  UNIQUE INDEX `elder_id_UNIQUE` (`elder_id` ASC) VISIBLE,
  INDEX `fk_elders_users1_idx` (`users_user_id` ASC) VISIBLE,
  INDEX `fk_elders_companions1_idx` (`companions_companion_id` ASC) VISIBLE,
  CONSTRAINT `fk_elders_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `oppa`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_elders_companions1`
    FOREIGN KEY (`companions_companion_id`)
    REFERENCES `oppa`.`companions` (`companion_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`chats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`chats` (
  `chat_id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `providers_provider_id` INT NOT NULL,
  `elders_elder_id` INT NOT NULL,
  `companions_companion_id` INT NOT NULL,
  PRIMARY KEY (`chat_id`, `providers_provider_id`, `elders_elder_id`),
  UNIQUE INDEX `chat_id_UNIQUE` (`chat_id` ASC) VISIBLE,
  INDEX `fk_chats_providers1_idx` (`providers_provider_id` ASC) VISIBLE,
  INDEX `fk_chats_elders1_idx` (`elders_elder_id` ASC) VISIBLE,
  INDEX `fk_chats_companions1_idx` (`companions_companion_id` ASC) VISIBLE,
  CONSTRAINT `fk_chats_providers1`
    FOREIGN KEY (`providers_provider_id`)
    REFERENCES `oppa`.`providers` (`provider_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_chats_elders1`
    FOREIGN KEY (`elders_elder_id`)
    REFERENCES `oppa`.`elders` (`elder_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_chats_companions1`
    FOREIGN KEY (`companions_companion_id`)
    REFERENCES `oppa`.`companions` (`companion_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`message_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`message_types` (
  `message_type_id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`message_type_id`),
  UNIQUE INDEX `message_type_id_UNIQUE` (`message_type_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`messages` (
  `message_id` INT NOT NULL AUTO_INCREMENT,
  `message` VARCHAR(2000) NOT NULL,
  `datetime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `url` VARCHAR(2000) NULL DEFAULT NULL,
  `message_types_message_type_id` INT NOT NULL,
  `chats_chat_id` INT NOT NULL,
  PRIMARY KEY (`message_id`, `message_types_message_type_id`, `chats_chat_id`),
  UNIQUE INDEX `message_id_UNIQUE` (`message_id` ASC) VISIBLE,
  INDEX `fk_messages_message_types1_idx` (`message_types_message_type_id` ASC) VISIBLE,
  INDEX `fk_messages_chats1_idx` (`chats_chat_id` ASC) VISIBLE,
  CONSTRAINT `fk_messages_chats1`
    FOREIGN KEY (`chats_chat_id`)
    REFERENCES `oppa`.`chats` (`chat_id`),
  CONSTRAINT `fk_messages_message_types1`
    FOREIGN KEY (`message_types_message_type_id`)
    REFERENCES `oppa`.`message_types` (`message_type_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`records`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`records` (
  `record_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `description` VARCHAR(400) NOT NULL,
  `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `elders_elder_id` INT NOT NULL,
  `elders_companions_companion_id` INT NOT NULL,
  PRIMARY KEY (`record_id`),
  UNIQUE INDEX `record_id_UNIQUE` (`record_id` ASC) VISIBLE,
  INDEX `fk_records_elders1_idx` (`elders_elder_id` ASC, `elders_companions_companion_id` ASC) VISIBLE,
  CONSTRAINT `fk_records_elders1`
    FOREIGN KEY (`elders_elder_id`)
    REFERENCES `oppa`.`elders` (`elder_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`services` (
  `service_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(400) NOT NULL,
  `img_url` TEXT NOT NULL,
  `price` INT NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  UNIQUE INDEX `service_id_UNIQUE` (`service_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '	';


-- -----------------------------------------------------
-- Table `oppa`.`wallets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`wallets` (
  `wallet_id` INT NOT NULL AUTO_INCREMENT,
  `amount` INT NOT NULL,
  `total` INT NOT NULL,
  `datetime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_type` VARCHAR(45) NOT NULL,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`wallet_id`),
  UNIQUE INDEX `wallet_id_UNIQUE` (`wallet_id` ASC) VISIBLE,
  INDEX `fk_wallets_users1_idx` (`users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_wallets_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `oppa`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`admins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`admins` (
  `admin_id` INT NOT NULL AUTO_INCREMENT,
  `users_user_id` INT NOT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE INDEX `admin_id_UNIQUE` (`admin_id` ASC) VISIBLE,
  INDEX `fk_admins_users1_idx` (`users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_admins_users1`
    FOREIGN KEY (`users_user_id`)
    REFERENCES `oppa`.`users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`days`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`days` (
  `day_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `workable` TINYINT NOT NULL,
  PRIMARY KEY (`day_id`),
  UNIQUE INDEX `day_id_UNIQUE` (`day_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`providers_provide_services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`providers_provide_services` (
  `services_service_id` INT NOT NULL,
  `providers_provider_id` INT NOT NULL,
  `state` VARCHAR(45) NOT NULL,
  `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `days_day_id` INT NOT NULL,
  PRIMARY KEY (`services_service_id`, `providers_provider_id`, `days_day_id`),
  INDEX `fk_services_has_providers_providers1_idx` (`providers_provider_id` ASC) VISIBLE,
  INDEX `fk_services_has_providers_services1_idx` (`services_service_id` ASC) VISIBLE,
  INDEX `fk_providers_provide_services_days1_idx` (`days_day_id` ASC) VISIBLE,
  CONSTRAINT `fk_services_has_providers_services1`
    FOREIGN KEY (`services_service_id`)
    REFERENCES `oppa`.`services` (`service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_services_has_providers_providers1`
    FOREIGN KEY (`providers_provider_id`)
    REFERENCES `oppa`.`providers` (`provider_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_providers_provide_services_days1`
    FOREIGN KEY (`days_day_id`)
    REFERENCES `oppa`.`days` (`day_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `oppa`.`scheduled_services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`scheduled_services` (
  `elders_elder_id` INT NOT NULL,
  `providers_provide_services_services_service_id` INT NOT NULL,
  `providers_provide_services_providers_provider_id` INT NOT NULL,
  `datetime` DATETIME NOT NULL,
  `start` DATETIME NOT NULL,
  `end` DATETIME NOT NULL,
  `scheduledAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`elders_elder_id`, `providers_provide_services_services_service_id`, `providers_provide_services_providers_provider_id`),
  INDEX `fk_elders_has_providers_provide_services_providers_provide__idx` (`providers_provide_services_services_service_id` ASC, `providers_provide_services_providers_provider_id` ASC) VISIBLE,
  INDEX `fk_elders_has_providers_provide_services_elders1_idx` (`elders_elder_id` ASC) VISIBLE,
  CONSTRAINT `fk_elders_has_providers_provide_services_elders1`
    FOREIGN KEY (`elders_elder_id`)
    REFERENCES `oppa`.`elders` (`elder_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_elders_has_providers_provide_services_providers_provide_se1`
    FOREIGN KEY (`providers_provide_services_services_service_id` , `providers_provide_services_providers_provider_id`)
    REFERENCES `oppa`.`providers_provide_services` (`services_service_id` , `providers_provider_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
