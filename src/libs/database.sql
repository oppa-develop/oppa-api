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
CREATE SCHEMA IF NOT EXISTS `oppa` DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish_ci ;
USE `oppa` ;

-- -----------------------------------------------------
-- Table `oppa`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`roles` (
  `role_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE INDEX `role_id_UNIQUE` (`role_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(45) NOT NULL,
  `lastname` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `rut` VARCHAR(45) NOT NULL,
  `password` VARCHAR(32) NOT NULL,
  `gender` VARCHAR(45) NOT NULL,
  `img_url` VARCHAR(45) NOT NULL,
  `state` VARCHAR(45) NOT NULL,
  `roles_role_id` INT NOT NULL,
  `create_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `roles_role_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  INDEX `fk_user_roles_idx` (`roles_role_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_roles`
    FOREIGN KEY (`roles_role_id`)
    REFERENCES `oppa`.`roles` (`role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`wallets`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`wallets` (
  `wallet_id` INT NOT NULL AUTO_INCREMENT,
  `amount` INT NOT NULL,
  `total` INT NOT NULL,
  `datetime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  `transaction_type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`wallet_id`),
  UNIQUE INDEX `wallet_id_UNIQUE` (`wallet_id` ASC) VISIBLE,
  INDEX `fk_wallets_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  CONSTRAINT `fk_wallets_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`services` (
  `service_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(400) NOT NULL,
  `img_url` VARCHAR(2000) NOT NULL,
  `price` INT NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  UNIQUE INDEX `service_id_UNIQUE` (`service_id` ASC) VISIBLE)
ENGINE = InnoDB
COMMENT = '	';


-- -----------------------------------------------------
-- Table `oppa`.`message_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`message_types` (
  `message_type_id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`message_type_id`),
  UNIQUE INDEX `message_type_id_UNIQUE` (`message_type_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`chats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`chats` (
  `chat_id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`),
  UNIQUE INDEX `chat_id_UNIQUE` (`chat_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`messages`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`messages` (
  `message_id` INT NOT NULL AUTO_INCREMENT,
  `message` VARCHAR(2000) NOT NULL,
  `datetime` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `url` VARCHAR(2000) NULL,
  `message_types_message_type_id` INT NOT NULL,
  `chats_chat_id` INT NOT NULL,
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  PRIMARY KEY (`message_id`, `message_types_message_type_id`, `chats_chat_id`, `user_user_id`, `user_roles_role_id`),
  UNIQUE INDEX `message_id_UNIQUE` (`message_id` ASC) VISIBLE,
  INDEX `fk_messages_message_types1_idx` (`message_types_message_type_id` ASC) VISIBLE,
  INDEX `fk_messages_chats1_idx` (`chats_chat_id` ASC) VISIBLE,
  INDEX `fk_messages_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  CONSTRAINT `fk_messages_message_types1`
    FOREIGN KEY (`message_types_message_type_id`)
    REFERENCES `oppa`.`message_types` (`message_type_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_messages_chats1`
    FOREIGN KEY (`chats_chat_id`)
    REFERENCES `oppa`.`chats` (`chat_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_messages_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`user_has_chats`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`user_has_chats` (
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  `chats_chat_id` INT NOT NULL,
  PRIMARY KEY (`user_user_id`, `user_roles_role_id`, `chats_chat_id`),
  INDEX `fk_user_has_chats_chats1_idx` (`chats_chat_id` ASC) VISIBLE,
  INDEX `fk_user_has_chats_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_chats_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_chats_chats1`
    FOREIGN KEY (`chats_chat_id`)
    REFERENCES `oppa`.`chats` (`chat_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`user_offers_services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`user_offers_services` (
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  `services_service_id` INT NOT NULL,
  `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_user_id`, `user_roles_role_id`, `services_service_id`),
  INDEX `fk_user_has_services1_services1_idx` (`services_service_id` ASC) VISIBLE,
  INDEX `fk_user_has_services1_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_services1_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_services1_services1`
    FOREIGN KEY (`services_service_id`)
    REFERENCES `oppa`.`services` (`service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`records`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`records` (
  `record_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `description` VARCHAR(400) NOT NULL,
  `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  PRIMARY KEY (`record_id`, `user_user_id`, `user_roles_role_id`),
  UNIQUE INDEX `record_id_UNIQUE` (`record_id` ASC) VISIBLE,
  INDEX `fk_records_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  CONSTRAINT `fk_records_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`user_schedules_services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`user_schedules_services` (
  `iduser_schedules_services` INT NOT NULL AUTO_INCREMENT,
  `start` DATETIME NOT NULL,
  `end` DATETIME NOT NULL,
  `rank` INT NULL,
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  `user_offers_services_user_user_id` INT NOT NULL,
  `user_offers_services_user_roles_role_id` INT NOT NULL,
  `user_offers_services_services_service_id` INT NOT NULL,
  `services_service_id` INT NOT NULL,
  `datetime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`iduser_schedules_services`, `user_offers_services_user_user_id`, `user_offers_services_user_roles_role_id`, `user_offers_services_services_service_id`, `services_service_id`),
  INDEX `fk_user_schedules_services_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  INDEX `fk_user_schedules_services_user_offers_services1_idx` (`user_offers_services_user_user_id` ASC, `user_offers_services_user_roles_role_id` ASC, `user_offers_services_services_service_id` ASC) VISIBLE,
  INDEX `fk_user_schedules_services_services1_idx` (`services_service_id` ASC) VISIBLE,
  UNIQUE INDEX `iduser_schedules_services_UNIQUE` (`iduser_schedules_services` ASC) VISIBLE,
  CONSTRAINT `fk_user_schedules_services_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_schedules_services_user_offers_services1`
    FOREIGN KEY (`user_offers_services_user_user_id` , `user_offers_services_user_roles_role_id` , `user_offers_services_services_service_id`)
    REFERENCES `oppa`.`user_offers_services` (`user_user_id` , `user_roles_role_id` , `services_service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_schedules_services_services1`
    FOREIGN KEY (`services_service_id`)
    REFERENCES `oppa`.`services` (`service_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `oppa`.`user_support_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `oppa`.`user_support_users` (
  `user_user_id` INT NOT NULL,
  `user_roles_role_id` INT NOT NULL,
  `user_supported_user_id` INT NOT NULL,
  `user_supported_roles_role_id` INT NOT NULL,
  PRIMARY KEY (`user_user_id`, `user_roles_role_id`, `user_supported_user_id`, `user_supported_roles_role_id`),
  INDEX `fk_user_has_user_user2_idx` (`user_supported_user_id` ASC, `user_supported_roles_role_id` ASC) VISIBLE,
  INDEX `fk_user_has_user_user1_idx` (`user_user_id` ASC, `user_roles_role_id` ASC) VISIBLE,
  UNIQUE INDEX `user_user_id1_UNIQUE` (`user_supported_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_user_user1`
    FOREIGN KEY (`user_user_id` , `user_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_user_user2`
    FOREIGN KEY (`user_supported_user_id` , `user_supported_roles_role_id`)
    REFERENCES `oppa`.`user` (`user_id` , `roles_role_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
