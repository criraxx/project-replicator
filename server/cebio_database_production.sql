-- ============================================================
-- CEBIO Brasil - Script de Produção do Banco de Dados
-- MySQL 8.x / MariaDB 10.6+
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Gerado em: 2026-04-12
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- DROP TABLES (ordem inversa de dependências)
-- ============================================================

DROP TABLE IF EXISTS `system_config`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `project_files`;
DROP TABLE IF EXISTS `project_links`;
DROP TABLE IF EXISTS `project_comments`;
DROP TABLE IF EXISTS `project_versions`;
DROP TABLE IF EXISTS `project_authors`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `academic_levels`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(64) DEFAULT NULL,
  `hashed_password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','pesquisador','bolsista') NOT NULL DEFAULT 'bolsista',
  `institution` VARCHAR(300) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `department` VARCHAR(300) DEFAULT NULL,
  `birth_date` DATE DEFAULT NULL,
  `registration_number` VARCHAR(100) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_temp_password` TINYINT(1) NOT NULL DEFAULT 1,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 0,
  `last_login` DATETIME DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_cpf` (`cpf`),
  INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. CATEGORIES
-- ============================================================

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `color` VARCHAR(10) DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  INDEX `idx_categories_active` (`is_active`),
  CONSTRAINT `fk_categories_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. ACADEMIC_LEVELS
-- ============================================================

CREATE TABLE `academic_levels` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_academic_levels_slug` (`slug`),
  INDEX `idx_academic_levels_active` (`is_active`),
  CONSTRAINT `fk_academic_levels_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. PROJECTS
-- ============================================================

CREATE TABLE `projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `academic_level` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('rascunho','pendente','em_revisao','aprovado','rejeitado','aguardando_autores','devolvido') NOT NULL DEFAULT 'rascunho',
  `owner_id` INT NOT NULL,
  `reviewed_by` INT DEFAULT NULL,
  `review_comment` TEXT DEFAULT NULL,
  `reviewed_at` DATETIME DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deleted_at` DATETIME DEFAULT NULL,
  `deleted_by` INT DEFAULT NULL,
  `has_pending_edit` TINYINT(1) NOT NULL DEFAULT 0,
  `pending_edit_data` TEXT DEFAULT NULL,
  `pending_edit_by` INT DEFAULT NULL,
  `pending_edit_at` DATETIME DEFAULT NULL,
  `pending_edit_comment` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_projects_owner` (`owner_id`),
  INDEX `idx_projects_status` (`status`),
  INDEX `idx_projects_deleted` (`is_deleted`),
  INDEX `idx_projects_category` (`category`),
  CONSTRAINT `fk_projects_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PROJECT_AUTHORS
-- ============================================================

CREATE TABLE `project_authors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `cpf` VARCHAR(20) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `institution` VARCHAR(300) DEFAULT NULL,
  `academic_level` VARCHAR(100) DEFAULT NULL,
  `role_in_project` VARCHAR(100) DEFAULT NULL,
  `is_owner` TINYINT(1) NOT NULL DEFAULT 0,
  `approval_status` ENUM('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
  `rejection_reason` TEXT DEFAULT NULL,
  `responded_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_authors_project` (`project_id`),
  INDEX `idx_project_authors_user` (`user_id`),
  INDEX `idx_project_authors_cpf` (`cpf`),
  INDEX `idx_project_authors_status` (`approval_status`),
  CONSTRAINT `fk_project_authors_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_authors_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. PROJECT_VERSIONS
-- ============================================================

CREATE TABLE `project_versions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `field_changed` VARCHAR(100) NOT NULL,
  `old_value` TEXT DEFAULT NULL,
  `new_value` TEXT DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `changed_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_versions_project` (`project_id`),
  INDEX `idx_project_versions_changed_by` (`changed_by`),
  CONSTRAINT `fk_project_versions_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_versions_user` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. PROJECT_COMMENTS
-- ============================================================

CREATE TABLE `project_comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_comments_project` (`project_id`),
  INDEX `idx_project_comments_user` (`user_id`),
  CONSTRAINT `fk_project_comments_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. PROJECT_LINKS
-- ============================================================

CREATE TABLE `project_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `link_type` VARCHAR(50) NOT NULL DEFAULT 'outro',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_links_project` (`project_id`),
  CONSTRAINT `fk_project_links_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. PROJECT_FILES
-- ============================================================

CREATE TABLE `project_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT NOT NULL DEFAULT 0,
  `file_category` VARCHAR(20) NOT NULL DEFAULT 'other',
  `uploaded_by` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_files_project` (`project_id`),
  INDEX `idx_project_files_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_project_files_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. AUDIT_LOGS
-- ============================================================

CREATE TABLE `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `action` VARCHAR(100) NOT NULL,
  `user_id` INT DEFAULT NULL,
  `target_user_id` INT DEFAULT NULL,
  `target_project_id` INT DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `severity` ENUM('low','medium','high') NOT NULL DEFAULT 'low',
  `timestamp` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_logs_user` (`user_id`),
  INDEX `idx_audit_logs_action` (`action`),
  INDEX `idx_audit_logs_severity` (`severity`),
  INDEX `idx_audit_logs_timestamp` (`timestamp`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================

CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
  `category` VARCHAR(50) DEFAULT NULL,
  `related_project_id` INT DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_read` (`is_read`),
  INDEX `idx_notifications_type` (`notification_type`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. SYSTEM_CONFIG
-- ============================================================

CREATE TABLE `system_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_system_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DADOS INICIAIS - Apenas usuário administrador
-- ============================================================

-- Senha: admin123 (SHA256 - o backend migra para bcrypt no primeiro login)
INSERT INTO `users` (`email`, `name`, `hashed_password`, `role`, `institution`, `is_active`, `is_temp_password`, `must_change_password`)
VALUES (
  'admin@cebio.org.br',
  'Administrador CEBIO',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin',
  'CEBIO',
  1,
  0,
  0
);

-- Configurações padrão do sistema
INSERT INTO `system_config` (`key`, `value`) VALUES
  ('system_name', 'CEBIO Brasil'),
  ('max_file_size_mb', '10'),
  ('allowed_file_types', 'pdf,png,jpg,jpeg,doc,docx'),
  ('maintenance_mode', 'false'),
  ('registration_enabled', 'true');

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
