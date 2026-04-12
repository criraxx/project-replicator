/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.23-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cebio_brasil
-- ------------------------------------------------------
-- Server version	10.6.23-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_levels`
--

DROP TABLE IF EXISTS `academic_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_levels_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_levels`
--

LOCK TABLES `academic_levels` WRITE;
/*!40000 ALTER TABLE `academic_levels` DISABLE KEYS */;
INSERT INTO `academic_levels` VALUES (1,'Ensino Medio',NULL,'ensino-medio',1,1,1,'2026-04-11 01:11:03'),(2,'Graduacao',NULL,'graduacao',2,1,1,'2026-04-11 01:11:03'),(3,'Mestrado',NULL,'mestrado',3,1,1,'2026-04-11 01:11:03'),(4,'Doutorado',NULL,'doutorado',4,1,1,'2026-04-11 01:11:03'),(5,'Pos-Doutorado',NULL,'pos-doutorado',5,1,1,'2026-04-11 01:11:03');
/*!40000 ALTER TABLE `academic_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `target_user_id` int(11) DEFAULT NULL,
  `target_project_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `severity` enum('low','medium','high') NOT NULL DEFAULT 'low',
  `timestamp` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_timestamp` (`timestamp`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'LOGIN',1,NULL,NULL,'Login realizado: admin@cebio.org.br','10.101.121.1','low','2026-04-11 01:12:04','2026-04-11 01:12:04'),(2,'LOGIN',1,NULL,NULL,'Login realizado: admin@cebio.org.br','10.101.121.1','low','2026-04-11 01:19:29','2026-04-11 01:19:29'),(3,'UPDATE_PROJECT',1,NULL,2,'Projeto atualizado: Desenvolvimento de Aplicativo Mobile','10.101.121.1','low','2026-04-11 01:19:39','2026-04-11 01:19:39'),(4,'CREATE_USER',1,4,NULL,'Usuário criado: teste@gmail.com (pesquisador)','10.101.121.1','medium','2026-04-11 01:20:32','2026-04-11 01:20:32'),(5,'RESET_PASSWORD',1,4,NULL,'Senha resetada para: teste@gmail.com','10.101.121.1','high','2026-04-11 01:20:48','2026-04-11 01:20:48'),(6,'UPDATE_USER',1,4,NULL,'Usuário atualizado: teste@gmail.com','10.101.121.1','medium','2026-04-11 01:20:55','2026-04-11 01:20:55'),(7,'UPDATE_USER',1,4,NULL,'Usuário atualizado: teste@gmail.com','10.101.121.1','medium','2026-04-11 01:20:58','2026-04-11 01:20:58'),(8,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:21:15','2026-04-11 01:21:15'),(9,'CREATE_PROJECT',4,NULL,6,'Projeto criado: 1111111111','10.101.121.1','low','2026-04-11 01:24:02','2026-04-11 01:24:02'),(10,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:28:37','2026-04-11 01:28:37'),(11,'CREATE_PROJECT',4,NULL,7,'Projeto criado: 6777777777','10.101.121.1','low','2026-04-11 01:29:36','2026-04-11 01:29:36'),(12,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:33:08','2026-04-11 01:33:08'),(13,'CREATE_PROJECT',4,NULL,8,'Projeto criado: wwwwwwwwwwwwwww','10.101.121.1','low','2026-04-11 01:33:57','2026-04-11 01:33:57'),(14,'CREATE_PROJECT',4,NULL,9,'Projeto criado: rrrrrrrrrrrrrrrrr','10.101.121.1','low','2026-04-11 01:35:00','2026-04-11 01:35:00'),(15,'LOGIN',5,NULL,NULL,'Login realizado: manus@test.com','127.0.0.1','low','2026-04-11 01:36:08','2026-04-11 01:36:08'),(16,'CREATE_PROJECT',5,NULL,10,'Projeto criado: Projeto de Teste Manus','127.0.0.1','low','2026-04-11 01:36:18','2026-04-11 01:36:18'),(17,'LOGIN',5,NULL,NULL,'Login realizado: manus@test.com','127.0.0.1','low','2026-04-11 01:40:22','2026-04-11 01:40:22'),(18,'UPLOAD_FILES',5,NULL,10,'1 arquivo(s) enviado(s) para projeto #10','127.0.0.1','low','2026-04-11 01:40:22','2026-04-11 01:40:22'),(19,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:41:52','2026-04-11 01:41:52'),(20,'CREATE_PROJECT',4,NULL,11,'Projeto criado: wwwwwwwwwwwwwwww','10.101.121.1','low','2026-04-11 01:42:14','2026-04-11 01:42:14'),(21,'UPLOAD_FILES',4,NULL,11,'1 arquivo(s) enviado(s) para projeto #11','10.101.121.1','low','2026-04-11 01:42:15','2026-04-11 01:42:15'),(22,'UPLOAD_FILES',4,NULL,11,'1 arquivo(s) enviado(s) para projeto #11','10.101.121.1','low','2026-04-11 01:42:15','2026-04-11 01:42:15'),(23,'UPLOAD_FILES',4,NULL,11,'1 arquivo(s) enviado(s) para projeto #11','10.101.121.1','low','2026-04-11 01:42:16','2026-04-11 01:42:16'),(24,'LOGIN',1,NULL,NULL,'Login realizado: admin@cebio.org.br','10.101.121.1','low','2026-04-11 01:42:49','2026-04-11 01:42:49'),(25,'UPDATE_PROJECT',1,NULL,10,'Projeto atualizado: Projeto de Teste Manus','10.101.121.1','low','2026-04-11 01:43:04','2026-04-11 01:43:04'),(26,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:43:33','2026-04-11 01:43:33'),(27,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:51:44','2026-04-11 01:51:44'),(28,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:53:57','2026-04-11 01:53:57'),(29,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 01:56:54','2026-04-11 01:56:54'),(30,'CREATE_PROJECT',4,NULL,12,'Projeto criado: ssssssssss','10.101.121.1','low','2026-04-11 01:57:11','2026-04-11 01:57:11'),(31,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 02:01:50','2026-04-11 02:01:50'),(32,'CREATE_PROJECT',4,NULL,13,'Projeto criado: sad sd (aguardando aprovacao de coautores)','10.101.121.1','low','2026-04-11 02:02:28','2026-04-11 02:02:28'),(33,'UPLOAD_FILES',4,NULL,13,'1 arquivo(s) enviado(s) para projeto #13','10.101.121.1','low','2026-04-11 02:02:28','2026-04-11 02:02:28'),(34,'UPLOAD_FILES',4,NULL,13,'1 arquivo(s) enviado(s) para projeto #13','10.101.121.1','low','2026-04-11 02:02:29','2026-04-11 02:02:29'),(35,'UPLOAD_FILES',4,NULL,13,'1 arquivo(s) enviado(s) para projeto #13','10.101.121.1','low','2026-04-11 02:02:29','2026-04-11 02:02:29'),(36,'CREATE_PROJECT',4,NULL,14,'Projeto criado: aaaaaaaaaaaaaaaaa','10.101.121.1','low','2026-04-11 02:02:50','2026-04-11 02:02:50'),(37,'LOGIN',1,NULL,NULL,'Login realizado: admin@cebio.org.br','10.101.121.1','low','2026-04-11 02:04:32','2026-04-11 02:04:32'),(38,'RESET_PASSWORD',1,5,NULL,'Senha resetada para: manus@test.com','10.101.121.1','high','2026-04-11 02:04:40','2026-04-11 02:04:40'),(39,'LOGIN',5,NULL,NULL,'Login realizado: manus@test.com','10.101.121.1','low','2026-04-11 02:05:00','2026-04-11 02:05:00'),(40,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 02:05:35','2026-04-11 02:05:35'),(41,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 02:12:05','2026-04-11 02:12:05'),(42,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 02:14:25','2026-04-11 02:14:25'),(43,'CREATE_PROJECT',4,NULL,15,'Projeto criado: ssssssss (aguardando aprovacao de coautores)','10.101.121.1','low','2026-04-11 02:14:46','2026-04-11 02:14:46'),(44,'LOGIN',5,NULL,NULL,'Login realizado: manus@test.com','10.101.121.1','low','2026-04-11 02:15:00','2026-04-11 02:15:00'),(45,'CREATE_PROJECT',5,NULL,16,'Projeto criado: ddddddddddddddddd sa ds a (aguardando aprovacao de coautores)','10.101.121.1','low','2026-04-11 02:24:30','2026-04-11 02:24:30'),(46,'LOGIN',4,NULL,NULL,'Login realizado: teste@gmail.com','10.101.121.1','low','2026-04-11 02:24:41','2026-04-11 02:24:41'),(47,'LOGIN',5,NULL,NULL,'Login realizado: manus@test.com','10.101.121.1','low','2026-04-11 02:26:10','2026-04-11 02:26:10');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `color` varchar(10) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Biologia','Pesquisas em Biologia','biologia','#4CAF50','flask',1,1,'2026-04-11 01:11:03'),(2,'Quimica','Pesquisas em Quimica','quimica','#2196F3','beaker',1,1,'2026-04-11 01:11:03'),(3,'Fisica','Pesquisas em Fisica','fisica','#FF9800','atom',1,1,'2026-04-11 01:11:03'),(4,'Tecnologia','Pesquisas em Tecnologia','tecnologia','#9C27B0','laptop',1,1,'2026-04-11 01:11:03'),(5,'Saude','Pesquisas em Saude','saude','#F44336','heart',1,1,'2026-04-11 01:11:03');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `category` varchar(50) DEFAULT NULL,
  `related_project_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,'ola','oi','info',NULL,NULL,1,'2026-04-11 01:21:04'),(2,5,'Solicitação de Coautoria','Você foi adicionado como coautor no projeto \"sad sd\". Acesse seus projetos para aprovar ou rejeitar sua participação.','warning','coautoria',13,0,'2026-04-11 02:02:28'),(3,4,'Coautor Rejeitou Participação','Manus Test rejeitou participar do projeto \"sad sd\". Motivo: teste','error','coautoria',13,1,'2026-04-11 02:05:18'),(4,5,'Solicitação de Participação','Você foi adicionado como colaborador no projeto \"ssssssss\". Acesse seus projetos para aprovar ou rejeitar sua participação.','warning','coautoria',15,1,'2026-04-11 02:14:46'),(5,4,'Todos os Colaboradores Aprovaram','Todos os colaboradores do projeto \"ssssssss\" aprovaram sua participação. O projeto agora está pendente de revisão administrativa.','success','coautoria',15,0,'2026-04-11 02:23:22'),(6,4,'Solicitação de Participação','Você foi adicionado como colaborador no projeto \"ddddddddddddddddd sa ds a\". Acesse seus projetos para aprovar ou rejeitar sua participação.','warning','coautoria',16,0,'2026-04-11 02:24:30'),(7,5,'Colaborador Rejeitou Participação','teste rejeitou participar do projeto \"ddddddddddddddddd sa ds a\". Motivo: teste','error','coautoria',16,0,'2026-04-11 02:26:01');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_authors`
--

DROP TABLE IF EXISTS `project_authors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_authors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `cpf` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `institution` varchar(300) DEFAULT NULL,
  `academic_level` varchar(100) DEFAULT NULL,
  `role_in_project` varchar(100) DEFAULT NULL,
  `is_owner` tinyint(1) NOT NULL DEFAULT 0,
  `approval_status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
  `rejection_reason` text DEFAULT NULL,
  `responded_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pa_project` (`project_id`),
  KEY `idx_pa_user` (`user_id`),
  KEY `idx_pa_cpf` (`cpf`),
  CONSTRAINT `fk_pa_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_authors`
--

LOCK TABLES `project_authors` WRITE;
/*!40000 ALTER TABLE `project_authors` DISABLE KEYS */;
INSERT INTO `project_authors` VALUES (1,6,4,'11111111111','teste','11111111111111','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:24:02','2026-04-11 01:24:02','2026-04-11 01:24:02'),(2,7,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:29:36','2026-04-11 01:29:36','2026-04-11 01:29:36'),(3,8,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:33:57','2026-04-11 01:33:57','2026-04-11 01:33:57'),(4,9,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:35:00','2026-04-11 01:35:00','2026-04-11 01:35:00'),(5,10,5,'12345678901','Manus Test','Manus Lab','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:36:18','2026-04-11 01:36:18','2026-04-11 01:36:18'),(6,11,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:42:14','2026-04-11 01:42:14','2026-04-11 01:42:14'),(7,12,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 01:57:11','2026-04-11 01:57:11','2026-04-11 01:57:11'),(8,13,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 02:02:28','2026-04-11 02:02:28','2026-04-11 02:02:28'),(9,13,5,'12345678901','Manus Test','sda sd','graduacao','Coautor',0,'rejeitado','teste','2026-04-11 02:05:18','2026-04-11 02:02:28','2026-04-11 02:05:18'),(10,14,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 02:02:50','2026-04-11 02:02:50','2026-04-11 02:02:50'),(11,15,4,'11111111111','teste','If goiano','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 02:14:46','2026-04-11 02:14:46','2026-04-11 02:14:46'),(12,15,5,'12345678901','Manus Test','ssssss','graduacao','Coautor',0,'aprovado',NULL,'2026-04-11 02:23:22','2026-04-11 02:14:46','2026-04-11 02:23:22'),(13,16,5,'12345678901','Manus Test','','graduacao','Autor Principal',1,'aprovado',NULL,'2026-04-11 02:24:30','2026-04-11 02:24:30','2026-04-11 02:24:30'),(14,16,4,'11111111111','teste','If goiano','graduacao','Coautor',0,'rejeitado','teste','2026-04-11 02:26:01','2026-04-11 02:24:30','2026-04-11 02:26:01');
/*!40000 ALTER TABLE `project_authors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_comments`
--

DROP TABLE IF EXISTS `project_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pc_project` (`project_id`),
  KEY `fk_pc_user` (`user_id`),
  CONSTRAINT `fk_pc_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_comments`
--

LOCK TABLES `project_comments` WRITE;
/*!40000 ALTER TABLE `project_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_files`
--

DROP TABLE IF EXISTS `project_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_category` varchar(20) NOT NULL DEFAULT 'other',
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pf_project` (`project_id`),
  KEY `idx_pf_category` (`file_category`),
  KEY `fk_pf_user` (`uploaded_by`),
  CONSTRAINT `fk_pf_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pf_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_files`
--

LOCK TABLES `project_files` WRITE;
/*!40000 ALTER TABLE `project_files` DISABLE KEYS */;
INSERT INTO `project_files` VALUES (1,10,'1775885957832-661305413.png','test_image.png','image/png','/home/ubuntu/project_replicator/server/uploads/project_10/1775885957832-661305413.png',19,'photo',5,'2026-04-11 01:39:17'),(2,10,'1775885981239-967679918.pdf','test_doc.pdf','application/pdf','/home/ubuntu/project_replicator/server/uploads/project_10/1775885981239-967679918.pdf',17,'pdf',5,'2026-04-11 01:39:41'),(3,10,'1775886022801-705082781.png','test_image.png','image/png','/home/ubuntu/project_replicator/server/uploads/project_10/1775886022801-705082781.png',19,'photo',5,'2026-04-11 01:40:22'),(4,11,'1775886135114-713376723.png','LOGO UTT.png','image/png','/home/ubuntu/project_replicator/server/uploads/project_11/1775886135114-713376723.png',25785,'photo',4,'2026-04-11 01:42:15'),(5,11,'1775886135327-515734258.png','marca-fapeg-transparente.png','image/png','/home/ubuntu/project_replicator/server/uploads/project_11/1775886135327-515734258.png',97359,'photo',4,'2026-04-11 01:42:15'),(6,11,'1775886135667-160423292.pdf','relatorio_cebio.pdf','application/pdf','/home/ubuntu/project_replicator/server/uploads/project_11/1775886135667-160423292.pdf',327613,'pdf',4,'2026-04-11 01:42:16'),(7,13,'1775887348741-450095531.png','LOGO UTT.png','image/png','/home/ubuntu/project_replicator/server/uploads/project_13/1775887348741-450095531.png',25785,'photo',4,'2026-04-11 02:02:28'),(8,13,'1775887348957-749318360.png','marca-fapeg-transparente.png','image/png','/home/ubuntu/project_replicator/server/uploads/project_13/1775887348957-749318360.png',97359,'photo',4,'2026-04-11 02:02:29'),(9,13,'1775887349197-896120210.pdf','relatorio_cebio (1).pdf','application/pdf','/home/ubuntu/project_replicator/server/uploads/project_13/1775887349197-896120210.pdf',327613,'pdf',4,'2026-04-11 02:02:29');
/*!40000 ALTER TABLE `project_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_links`
--

DROP TABLE IF EXISTS `project_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `link_type` varchar(50) DEFAULT 'outro',
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pl_project` (`project_id`),
  CONSTRAINT `fk_pl_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_links`
--

LOCK TABLES `project_links` WRITE;
/*!40000 ALTER TABLE `project_links` DISABLE KEYS */;
INSERT INTO `project_links` VALUES (1,6,'google','https://www.google.com','2026-04-11 01:24:02','outro',NULL),(2,7,'olaa','https://8000-iakscc8c7g9i0ft6ck7tf-609e95a1.us1.manus.computer/pesquisador/submissao','2026-04-11 01:29:36','outro','aaa'),(3,8,'asdadads','https://8000-sadad','2026-04-11 01:33:57','outro','sadddd');
/*!40000 ALTER TABLE `project_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_versions`
--

DROP TABLE IF EXISTS `project_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_versions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `field_changed` varchar(100) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `changed_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pv_project` (`project_id`),
  KEY `fk_pv_user` (`changed_by`),
  CONSTRAINT `fk_pv_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pv_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_versions`
--

LOCK TABLES `project_versions` WRITE;
/*!40000 ALTER TABLE `project_versions` DISABLE KEYS */;
INSERT INTO `project_versions` VALUES (1,2,'status','pendente','aprovado',NULL,1,'2026-04-11 01:19:39'),(2,10,'status','pendente','aprovado',NULL,1,'2026-04-11 01:43:04');
/*!40000 ALTER TABLE `project_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `academic_level` varchar(100) DEFAULT NULL,
  `status` enum('rascunho','pendente','em_revisao','aprovado','rejeitado','aguardando_autores','devolvido') NOT NULL DEFAULT 'rascunho',
  `owner_id` int(11) NOT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `review_comment` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `has_pending_edit` tinyint(1) NOT NULL DEFAULT 0,
  `pending_edit_data` text DEFAULT NULL,
  `pending_edit_by` int(11) DEFAULT NULL,
  `pending_edit_at` datetime DEFAULT NULL,
  `pending_edit_comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_projects_owner` (`owner_id`),
  KEY `idx_projects_status` (`status`),
  KEY `idx_projects_category` (`category`),
  CONSTRAINT `fk_projects_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Estudo de Biodiversidade em Goias','Analise da biodiversidade local','Pesquisa completa sobre a biodiversidade da regiao de Goias','Biologia','Mestrado','aprovado',2,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:11:03'),(2,'Desenvolvimento de Aplicativo Mobile','App para gestao de projetos','Desenvolvimento de aplicativo mobile para gestao de projetos de pesquisa','Tecnologia','Graduacao','aprovado',3,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:19:39'),(3,'Analise de Compostos Quimicos','Estudo de novos compostos','Analise e sintese de novos compostos quimicos','Quimica','Doutorado','em_revisao',2,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:11:03'),(4,'Efeitos da Radiacao Solar','Estudo de impactos da radiacao','Pesquisa sobre os efeitos da radiacao solar em organismos vivos','Fisica','Mestrado','aprovado',2,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:11:03'),(5,'Prevencao de Doencas Infecciosas','Estrategias de prevencao','Desenvolvimento de estrategias para prevencao de doencas infecciosas','Saude','Doutorado','rejeitado',2,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:11:03'),(6,'1111111111','sads d s da sd','sads d s da sd','artigos','doutorado','pendente',4,NULL,NULL,NULL,'2005-11-21','2000-11-10',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:24:02','2026-04-11 01:24:02'),(7,'6777777777','m m m m m m m m m m m m n n n b b b b b','m m m m m m m m m m m m n n n b b b b b','pesquisa','graduacao','pendente',4,NULL,NULL,NULL,'2000-07-06','2060-11-10',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:29:36','2026-04-11 01:29:36'),(8,'wwwwwwwwwwwwwww','ddsf df s dfs df sd f sdf sd f sd f sd s df sd f sd f','ddsf df s dfs df sd f sdf sd f sd f sd s df sd f sd f','pesquisa','graduacao','pendente',4,NULL,NULL,NULL,'2000-02-01','2300-11-21',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:33:57','2026-04-11 01:33:57'),(9,'rrrrrrrrrrrrrrrrr','sd asd s d','sd asd s d','quimica','graduacao','pendente',4,NULL,NULL,NULL,'2000-02-29','3000-12-21',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:35:00','2026-04-11 01:35:00'),(10,'Projeto de Teste Manus','Resumo do projeto de teste',NULL,'pesquisa','graduacao','aprovado',5,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:36:18','2026-04-11 01:43:04'),(11,'wwwwwwwwwwwwwwww','sda sd s ds ad s','sda sd s ds ad s','pesquisa','graduacao','pendente',4,NULL,NULL,NULL,'2220-02-21','2222-02-21',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:42:14','2026-04-11 01:42:14'),(12,'ssssssssss','dsfd ds df sd','dsfd ds df sd','pesquisa','graduacao','rascunho',4,NULL,NULL,NULL,'2222-12-21','3333-12-21',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 01:57:11','2026-04-11 01:57:11'),(13,'sad sd','dddddddddd dddddd','dddddddddd dddddd','pesquisa','graduacao','pendente',4,NULL,NULL,NULL,'2222-12-21','2224-12-21',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 02:02:28','2026-04-11 02:02:28'),(14,'aaaaaaaaaaaaaaaaa','ffffffffffff','ffffffffffff','pesquisa','graduacao','rascunho',4,NULL,NULL,NULL,'2222-12-21','2223-12-21',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 02:02:50','2026-04-11 02:02:50'),(15,'ssssssss','ddddddddddd','ddddddddddd','pesquisa','graduacao','pendente',4,NULL,NULL,NULL,'2222-12-21','3333-12-22',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 02:14:46','2026-04-11 02:23:22'),(16,'ddddddddddddddddd sa ds a','333333 dfs f sdf','333333 dfs f sdf','quimica','mestrado','devolvido',5,NULL,NULL,NULL,'2009-12-30','2020-12-30',0,NULL,NULL,0,NULL,NULL,NULL,NULL,'2026-04-11 02:24:30','2026-04-11 02:26:01');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `uk_config_key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (1,'system_name','CEBIO Brasil','2026-04-11 01:11:03'),(2,'max_file_size_mb','50','2026-04-11 01:11:03'),(3,'allowed_file_types','pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png','2026-04-11 01:11:03'),(4,'default_password','cebio2024','2026-04-11 01:11:03'),(5,'maintenance_mode','false','2026-04-11 01:11:03');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `cpf` varchar(64) DEFAULT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role` enum('admin','pesquisador','bolsista') NOT NULL DEFAULT 'bolsista',
  `institution` varchar(300) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(300) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_temp_password` tinyint(1) NOT NULL DEFAULT 1,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `last_login` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@cebio.org.br','Administrador CEBIO',NULL,'240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','admin','CEBIO',NULL,NULL,NULL,NULL,1,0,0,'2026-04-11 02:04:32',NULL,'2026-04-11 01:11:03','2026-04-11 02:04:32'),(2,'pesquisador@cebio.org.br','Dr. Joao Silva',NULL,'67671092f364614643411d3a0394b20de049ef436c2585f696cca4f02fe96374','pesquisador','Universidade Federal de Goias',NULL,NULL,NULL,NULL,1,0,0,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:11:03'),(3,'bolsista@cebio.org.br','Maria Santos',NULL,'e74c009c4614bbe55c729de59a8986999c5017a288aecbdd65b9d089926bc604','bolsista','Universidade Federal de Goias',NULL,NULL,NULL,NULL,1,0,0,NULL,NULL,'2026-04-11 01:11:03','2026-04-11 01:11:03'),(4,'teste@gmail.com','teste','11111111111','d0951ed732c35a02f39098783e64578687109b07e60033de5d9939d4237279dd','pesquisador','If goiano','22222222222',NULL,'2000-10-30','22222222',1,1,1,'2026-04-11 02:24:41',1,'2026-04-11 01:20:32','2026-04-11 02:24:41'),(5,'manus@test.com','Manus Test','12345678901','d0951ed732c35a02f39098783e64578687109b07e60033de5d9939d4237279dd','pesquisador',NULL,NULL,NULL,'1990-01-01',NULL,1,1,1,'2026-04-11 02:26:10',NULL,'2026-04-11 01:35:57','2026-04-11 02:26:10');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-11  2:26:55
