-- ============================================================
-- CEBIO Brasil - Schema Completo + Dados Iniciais
-- MySQL 8.x
-- Gerado automaticamente
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABELAS
-- ============================================================

-- Usuarios
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(64) DEFAULT NULL,
  `hashed_password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'pesquisador', 'bolsista') NOT NULL DEFAULT 'bolsista',
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
  KEY `idx_users_role` (`role`),
  KEY `idx_users_cpf` (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorias
DROP TABLE IF EXISTS `categories`;
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
  UNIQUE KEY `uk_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Niveis Academicos
DROP TABLE IF EXISTS `academic_levels`;
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
  UNIQUE KEY `uk_levels_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projetos
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `academic_level` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('pendente', 'em_revisao', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
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
  KEY `idx_projects_owner` (`owner_id`),
  KEY `idx_projects_status` (`status`),
  KEY `idx_projects_category` (`category`),
  CONSTRAINT `fk_projects_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Autores de Projetos
DROP TABLE IF EXISTS `project_authors`;
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
  `approval_status` ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
  `rejection_reason` TEXT DEFAULT NULL,
  `responded_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pa_project` (`project_id`),
  KEY `idx_pa_user` (`user_id`),
  KEY `idx_pa_cpf` (`cpf`),
  CONSTRAINT `fk_pa_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Versoes de Projetos
DROP TABLE IF EXISTS `project_versions`;
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
  KEY `idx_pv_project` (`project_id`),
  CONSTRAINT `fk_pv_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pv_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de Projetos
DROP TABLE IF EXISTS `project_comments`;
CREATE TABLE `project_comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pc_project` (`project_id`),
  CONSTRAINT `fk_pc_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Links de Projetos
DROP TABLE IF EXISTS `project_links`;
CREATE TABLE `project_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pl_project` (`project_id`),
  CONSTRAINT `fk_pl_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Arquivos de Projetos
DROP TABLE IF EXISTS `project_files`;
CREATE TABLE `project_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` INT NOT NULL,
  `file_category` VARCHAR(20) NOT NULL DEFAULT 'other',
  `uploaded_by` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pf_project` (`project_id`),
  KEY `idx_pf_category` (`file_category`),
  CONSTRAINT `fk_pf_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pf_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs de Auditoria
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `action` VARCHAR(100) NOT NULL,
  `user_id` INT DEFAULT NULL,
  `target_user_id` INT DEFAULT NULL,
  `target_project_id` INT DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `severity` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
  `timestamp` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_timestamp` (`timestamp`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notificacoes
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
  `category` VARCHAR(50) DEFAULT NULL,
  `related_project_id` INT DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuracoes do Sistema
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DADOS INICIAIS (SEED)
-- ============================================================

-- Usuarios de teste
-- Senhas: admin123, pesq123, bolsa123 (SHA256)
INSERT INTO `users` (`email`, `name`, `hashed_password`, `role`, `institution`, `is_active`, `is_temp_password`, `must_change_password`) VALUES
('admin@cebio.org.br', 'Administrador CEBIO', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'CEBIO', 1, 0, 0),
('pesquisador@cebio.org.br', 'Dr. Joao Silva', '67671092f364614643411d3a0394b20de049ef436c2585f696cca4f02fe96374', 'pesquisador', 'Universidade Federal de Goias', 1, 0, 0),
('bolsista@cebio.org.br', 'Maria Santos', 'e74c009c4614bbe55c729de59a8986999c5017a288aecbdd65b9d089926bc604', 'bolsista', 'Universidade Federal de Goias', 1, 0, 0);

-- Categorias
INSERT INTO `categories` (`name`, `slug`, `description`, `color`, `icon`, `is_active`, `created_by`) VALUES
('Biologia', 'biologia', 'Pesquisas em Biologia', '#4CAF50', 'flask', 1, 1),
('Quimica', 'quimica', 'Pesquisas em Quimica', '#2196F3', 'beaker', 1, 1),
('Fisica', 'fisica', 'Pesquisas em Fisica', '#FF9800', 'atom', 1, 1),
('Tecnologia', 'tecnologia', 'Pesquisas em Tecnologia', '#9C27B0', 'laptop', 1, 1),
('Saude', 'saude', 'Pesquisas em Saude', '#F44336', 'heart', 1, 1);

-- Niveis Academicos
INSERT INTO `academic_levels` (`name`, `slug`, `order`, `is_active`, `created_by`) VALUES
('Ensino Medio', 'ensino-medio', 1, 1, 1),
('Graduacao', 'graduacao', 2, 1, 1),
('Mestrado', 'mestrado', 3, 1, 1),
('Doutorado', 'doutorado', 4, 1, 1),
('Pos-Doutorado', 'pos-doutorado', 5, 1, 1);

-- Projetos de exemplo
INSERT INTO `projects` (`title`, `summary`, `description`, `category`, `academic_level`, `owner_id`, `status`) VALUES
('Estudo de Biodiversidade em Goias', 'Analise da biodiversidade local', 'Pesquisa completa sobre a biodiversidade da regiao de Goias', 'Biologia', 'Mestrado', 2, 'aprovado'),
('Desenvolvimento de Aplicativo Mobile', 'App para gestao de projetos', 'Desenvolvimento de aplicativo mobile para gestao de projetos de pesquisa', 'Tecnologia', 'Graduacao', 3, 'pendente'),
('Analise de Compostos Quimicos', 'Estudo de novos compostos', 'Analise e sintese de novos compostos quimicos', 'Quimica', 'Doutorado', 2, 'em_revisao'),
('Efeitos da Radiacao Solar', 'Estudo de impactos da radiacao', 'Pesquisa sobre os efeitos da radiacao solar em organismos vivos', 'Fisica', 'Mestrado', 2, 'aprovado'),
('Prevencao de Doencas Infecciosas', 'Estrategias de prevencao', 'Desenvolvimento de estrategias para prevencao de doencas infecciosas', 'Saude', 'Doutorado', 2, 'rejeitado');

-- Configuracoes iniciais do sistema
INSERT INTO `system_config` (`key`, `value`) VALUES
('system_name', 'CEBIO Brasil'),
('max_file_size_mb', '50'),
('allowed_file_types', 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png'),
('default_password', 'cebio2024'),
('maintenance_mode', 'false');

-- ============================================================
-- CREDENCIAIS DE ACESSO
-- ============================================================
-- admin@cebio.org.br    / admin123  (Administrador)
-- pesquisador@cebio.org.br / pesq123 (Pesquisador)
-- bolsista@cebio.org.br / bolsa123  (Bolsista)
-- ============================================================
