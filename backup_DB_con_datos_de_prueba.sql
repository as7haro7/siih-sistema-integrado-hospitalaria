CREATE DATABASE  IF NOT EXISTS `db_clinica_siih` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_clinica_siih`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: db_clinica_siih
-- ------------------------------------------------------
-- Server version	9.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '68706ec4-59e9-11f1-844a-bc5ff4488b61:1-1132';

--
-- Table structure for table `accounts_perfilusuario`
--

DROP TABLE IF EXISTS `accounts_perfilusuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts_perfilusuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cargo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `accounts_perfilusuario_user_id_240af46c_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts_perfilusuario`
--

LOCK TABLES `accounts_perfilusuario` WRITE;
/*!40000 ALTER TABLE `accounts_perfilusuario` DISABLE KEYS */;
INSERT INTO `accounts_perfilusuario` VALUES (1,'Administrador','70000001',10),(2,'Recepcionista','70000002',11),(3,'Cajero','70000003',12),(4,'Regente Farmacéutico','70000004',13),(5,'Médico General','70000005',14),(6,'Médico Pediatra','70000006',15),(7,'laboratorista','11111222222223333',16);
/*!40000 ALTER TABLE `accounts_perfilusuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_sistema`
--

DROP TABLE IF EXISTS `auditoria_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_sistema` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `usuario_accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro_afectado` int NOT NULL,
  `tipo_operacion` enum('INSERCION','LECTURA','EDICION','ELIMINACION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valores_anteriores` text COLLATE utf8mb4_unicode_ci,
  `valores_nuevos` text COLLATE utf8mb4_unicode_ci,
  `fecha_hora_evento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_sistema`
--

LOCK TABLES `auditoria_sistema` WRITE;
/*!40000 ALTER TABLE `auditoria_sistema` DISABLE KEYS */;
INSERT INTO `auditoria_sistema` VALUES (1,'Roberto Rojas','FACTURA',1,'EDICION','estado_pago=Pendiente','estado_pago=Pagado','2026-07-24 01:14:12',NULL),(2,'Roberto Rojas','FACTURA',2,'EDICION','estado_pago=Pendiente','estado_pago=Parcial','2026-07-24 01:14:12',NULL),(3,'Roberto Rojas','FACTURA',2,'EDICION','estado_pago=Parcial','estado_pago=Pagado','2026-07-24 01:14:12',NULL);
/*!40000 ALTER TABLE `auditoria_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
INSERT INTO `auth_group` VALUES (1,'Administrador'),(7,'Cajero'),(8,'Director'),(4,'Enfermera'),(6,'Farmacéutico'),(3,'Médico'),(2,'Recepcionista'),(5,'Técnico de Laboratorio');
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add Perfil de usuario',7,'add_perfilusuario'),(26,'Can change Perfil de usuario',7,'change_perfilusuario'),(27,'Can delete Perfil de usuario',7,'delete_perfilusuario'),(28,'Can view Perfil de usuario',7,'view_perfilusuario'),(29,'Can add Paciente',8,'add_paciente'),(30,'Can change Paciente',8,'change_paciente'),(31,'Can delete Paciente',8,'delete_paciente'),(32,'Can view Paciente',8,'view_paciente'),(33,'Can add Registro de baja',9,'add_registrobaja'),(34,'Can change Registro de baja',9,'change_registrobaja'),(35,'Can delete Registro de baja',9,'delete_registrobaja'),(36,'Can view Registro de baja',9,'view_registrobaja'),(37,'Can add Especialidad',10,'add_especialidad'),(38,'Can change Especialidad',10,'change_especialidad'),(39,'Can delete Especialidad',10,'delete_especialidad'),(40,'Can view Especialidad',10,'view_especialidad'),(41,'Can add Médico',11,'add_medico'),(42,'Can change Médico',11,'change_medico'),(43,'Can delete Médico',11,'delete_medico'),(44,'Can view Médico',11,'view_medico'),(45,'Can add Horario médico',12,'add_horariomedico'),(46,'Can change Horario médico',12,'change_horariomedico'),(47,'Can delete Horario médico',12,'delete_horariomedico'),(48,'Can view Horario médico',12,'view_horariomedico'),(49,'Can add Cita',13,'add_cita'),(50,'Can change Cita',13,'change_cita'),(51,'Can delete Cita',13,'delete_cita'),(52,'Can view Cita',13,'view_cita'),(53,'Can add Emergencia',14,'add_emergencia'),(54,'Can change Emergencia',14,'change_emergencia'),(55,'Can delete Emergencia',14,'delete_emergencia'),(56,'Can view Emergencia',14,'view_emergencia'),(57,'Can add Tarifa de habitación',15,'add_tarifahabitacion'),(58,'Can change Tarifa de habitación',15,'change_tarifahabitacion'),(59,'Can delete Tarifa de habitación',15,'delete_tarifahabitacion'),(60,'Can view Tarifa de habitación',15,'view_tarifahabitacion'),(61,'Can add Cama',16,'add_cama'),(62,'Can change Cama',16,'change_cama'),(63,'Can delete Cama',16,'delete_cama'),(64,'Can view Cama',16,'view_cama'),(65,'Can add Hospitalización',17,'add_hospitalizacion'),(66,'Can change Hospitalización',17,'change_hospitalizacion'),(67,'Can delete Hospitalización',17,'delete_hospitalizacion'),(68,'Can view Hospitalización',17,'view_hospitalizacion'),(69,'Can add Catálogo CIE-10',18,'add_catalogocie10'),(70,'Can change Catálogo CIE-10',18,'change_catalogocie10'),(71,'Can delete Catálogo CIE-10',18,'delete_catalogocie10'),(72,'Can view Catálogo CIE-10',18,'view_catalogocie10'),(73,'Can add Historial clínico',19,'add_historialclinico'),(74,'Can change Historial clínico',19,'change_historialclinico'),(75,'Can delete Historial clínico',19,'delete_historialclinico'),(76,'Can view Historial clínico',19,'view_historialclinico'),(77,'Can add Examen de laboratorio',20,'add_examenlaboratorio'),(78,'Can change Examen de laboratorio',20,'change_examenlaboratorio'),(79,'Can delete Examen de laboratorio',20,'delete_examenlaboratorio'),(80,'Can view Examen de laboratorio',20,'view_examenlaboratorio'),(81,'Can add Proveedor',21,'add_proveedor'),(82,'Can change Proveedor',21,'change_proveedor'),(83,'Can delete Proveedor',21,'delete_proveedor'),(84,'Can view Proveedor',21,'view_proveedor'),(85,'Can add Medicamento',22,'add_medicamento'),(86,'Can change Medicamento',22,'change_medicamento'),(87,'Can delete Medicamento',22,'delete_medicamento'),(88,'Can view Medicamento',22,'view_medicamento'),(89,'Can add Compra',23,'add_compra'),(90,'Can change Compra',23,'change_compra'),(91,'Can delete Compra',23,'delete_compra'),(92,'Can view Compra',23,'view_compra'),(93,'Can add Lote de medicamento',24,'add_lotemedicamento'),(94,'Can change Lote de medicamento',24,'change_lotemedicamento'),(95,'Can delete Lote de medicamento',24,'delete_lotemedicamento'),(96,'Can view Lote de medicamento',24,'view_lotemedicamento'),(97,'Can add Detalle de compra',25,'add_compradetalle'),(98,'Can change Detalle de compra',25,'change_compradetalle'),(99,'Can delete Detalle de compra',25,'delete_compradetalle'),(100,'Can view Detalle de compra',25,'view_compradetalle'),(101,'Can add Detalle de receta',26,'add_recetadetalle'),(102,'Can change Detalle de receta',26,'change_recetadetalle'),(103,'Can delete Detalle de receta',26,'delete_recetadetalle'),(104,'Can view Detalle de receta',26,'view_recetadetalle'),(105,'Can add Configuración de impuesto',27,'add_configimpuesto'),(106,'Can change Configuración de impuesto',27,'change_configimpuesto'),(107,'Can delete Configuración de impuesto',27,'delete_configimpuesto'),(108,'Can view Configuración de impuesto',27,'view_configimpuesto'),(109,'Can add Factura',28,'add_factura'),(110,'Can change Factura',28,'change_factura'),(111,'Can delete Factura',28,'delete_factura'),(112,'Can view Factura',28,'view_factura'),(113,'Can add Detalle de factura',29,'add_facturadetalle'),(114,'Can change Detalle de factura',29,'change_facturadetalle'),(115,'Can delete Detalle de factura',29,'delete_facturadetalle'),(116,'Can view Detalle de factura',29,'view_facturadetalle'),(117,'Can add Pago',30,'add_pago'),(118,'Can change Pago',30,'change_pago'),(119,'Can delete Pago',30,'delete_pago'),(120,'Can view Pago',30,'view_pago'),(121,'Can add Registro de auditoría',31,'add_auditoriasistema'),(122,'Can change Registro de auditoría',31,'change_auditoriasistema'),(123,'Can delete Registro de auditoría',31,'delete_auditoriasistema'),(124,'Can view Registro de auditoría',31,'view_auditoriasistema');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,1,'admin','','','admin@gmail.com',1,1,'2026-07-24 00:34:54.048941'),(10,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,1,'admin_siih','Admin','Sistema','admin@siih.local',1,1,'2026-07-23 21:14:12.000000'),(11,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,0,'recepcion1','Carla','Mendoza','carla.m@siih.local',1,1,'2026-07-23 21:14:12.000000'),(12,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,0,'caja_central','Roberto','Rojas','roberto.r@siih.local',1,1,'2026-07-23 21:14:12.000000'),(13,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,0,'farma_luz','Luz','Mamani','luz.m@siih.local',1,1,'2026-07-23 21:14:12.000000'),(14,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,0,'dr_perez','Juan','Perez','jperez@siih.local',1,1,'2026-07-23 21:14:12.000000'),(15,'pbkdf2_sha256$600000$AdaBZJoxX5XJ50hTQuIT4E$pHqtJ96t0F4Nypre+UgMKtF4TneTtNa6WouKGwybuAQ=',NULL,0,'dra_gomez','Maria','Gomez','mgomez@siih.local',1,1,'2026-07-23 21:14:12.000000'),(16,'pbkdf2_sha256$600000$wSC1azpEI4Ochu1gP1IQIE$mCd2lfAazDVTQwcZaIRbLslJCM5uvM1btQxeM3trb4w=',NULL,0,'elmer','elmer','patzy','elmer@gmail.com',0,1,'2026-07-24 01:38:42.991941');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
INSERT INTO `auth_user_groups` VALUES (1,11,2),(2,12,7),(3,13,6),(4,14,3),(5,15,3),(7,16,5);
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cama`
--

DROP TABLE IF EXISTS `cama`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cama` (
  `id_cama` int NOT NULL AUTO_INCREMENT,
  `nro_habitacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nro_cama` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_tarifa` int NOT NULL,
  `estado_cama` enum('Disponible','Ocupada','Mantenimiento') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Disponible',
  PRIMARY KEY (`id_cama`),
  UNIQUE KEY `nro_habitacion` (`nro_habitacion`,`nro_cama`),
  KEY `id_tarifa` (`id_tarifa`),
  CONSTRAINT `cama_ibfk_1` FOREIGN KEY (`id_tarifa`) REFERENCES `tarifa_habitacion` (`id_tarifa`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cama`
--

LOCK TABLES `cama` WRITE;
/*!40000 ALTER TABLE `cama` DISABLE KEYS */;
INSERT INTO `cama` VALUES (1,'101','A',1,'Disponible'),(2,'101','B',1,'Disponible'),(3,'102','A',2,'Disponible'),(4,'102','B',2,'Disponible'),(5,'201','A',3,'Ocupada'),(6,'202','A',3,'Disponible'),(7,'301','UTI-1',4,'Ocupada'),(8,'302','UTI-2',4,'Disponible');
/*!40000 ALTER TABLE `cama` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogo_cie10`
--

DROP TABLE IF EXISTS `catalogo_cie10`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogo_cie10` (
  `id_cie10` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_cie10`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogo_cie10`
--

LOCK TABLES `catalogo_cie10` WRITE;
/*!40000 ALTER TABLE `catalogo_cie10` DISABLE KEYS */;
INSERT INTO `catalogo_cie10` VALUES (1,'J00','Resfriado común'),(2,'A09','Gastroenteritis'),(3,'I10','Hipertensión esencial'),(4,'E11','Diabetes mellitus tipo 2'),(5,'M54','Dorsalgia (Dolor de espalda)'),(6,'J03','Amigdalitis aguda');
/*!40000 ALTER TABLE `catalogo_cie10` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cita`
--

DROP TABLE IF EXISTS `cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cita` (
  `id_cita` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `id_medico` int NOT NULL,
  `fecha_cita` date NOT NULL,
  `hora_cita` time NOT NULL,
  `estado_cita` enum('Pendiente','Confirmada','Atendida','Cancelada','No Asistio') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`id_cita`),
  UNIQUE KEY `id_medico` (`id_medico`,`fecha_cita`,`hora_cita`),
  KEY `id_paciente` (`id_paciente`),
  KEY `idx_cita_fecha` (`fecha_cita`),
  CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita`
--

LOCK TABLES `cita` WRITE;
/*!40000 ALTER TABLE `cita` DISABLE KEYS */;
INSERT INTO `cita` VALUES (1,1,1,'2026-07-21','09:00:00','Atendida'),(2,2,2,'2026-07-22','10:30:00','Atendida'),(3,3,4,'2026-07-23','08:00:00','Atendida'),(4,4,1,'2026-07-23','11:00:00','Pendiente'),(5,5,5,'2026-07-23','14:30:00','Pendiente'),(6,6,6,'2026-07-23','16:00:00','No Asistio'),(7,7,3,'2026-07-24','09:00:00','Confirmada'),(8,8,1,'2026-07-24','10:00:00','Confirmada'),(9,9,2,'2026-07-25','11:30:00','Pendiente');
/*!40000 ALTER TABLE `cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `id_proveedor` int NOT NULL,
  `fecha_compra` date NOT NULL,
  `numero_factura_compra` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_compra` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_compra`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
INSERT INTO `compra` VALUES (1,1,'2026-07-13','F-1001',1500.00),(2,2,'2026-07-18','F-2055',2300.00);
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra_detalle`
--

DROP TABLE IF EXISTS `compra_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra_detalle` (
  `id_compra_detalle` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `id_lote` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal_linea` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  PRIMARY KEY (`id_compra_detalle`),
  KEY `id_compra` (`id_compra`),
  KEY `id_lote` (`id_lote`),
  CONSTRAINT `compra_detalle_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  CONSTRAINT `compra_detalle_ibfk_2` FOREIGN KEY (`id_lote`) REFERENCES `lote_medicamento` (`id_lote`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra_detalle`
--

LOCK TABLES `compra_detalle` WRITE;
/*!40000 ALTER TABLE `compra_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `compra_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config_impuesto`
--

DROP TABLE IF EXISTS `config_impuesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config_impuesto` (
  `id_impuesto` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_impuesto`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config_impuesto`
--

LOCK TABLES `config_impuesto` WRITE;
/*!40000 ALTER TABLE `config_impuesto` DISABLE KEYS */;
INSERT INTO `config_impuesto` VALUES (1,'IVA',13.00),(2,'IT',3.00);
/*!40000 ALTER TABLE `config_impuesto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (7,'accounts','perfilusuario'),(1,'admin','logentry'),(31,'auditoria','auditoriasistema'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(13,'citas','cita'),(18,'clinico','catalogocie10'),(19,'clinico','historialclinico'),(5,'contenttypes','contenttype'),(14,'emergencias','emergencia'),(27,'facturacion','configimpuesto'),(28,'facturacion','factura'),(29,'facturacion','facturadetalle'),(30,'facturacion','pago'),(23,'farmacia','compra'),(25,'farmacia','compradetalle'),(24,'farmacia','lotemedicamento'),(22,'farmacia','medicamento'),(21,'farmacia','proveedor'),(26,'farmacia','recetadetalle'),(16,'hospitalizacion','cama'),(17,'hospitalizacion','hospitalizacion'),(15,'hospitalizacion','tarifahabitacion'),(20,'laboratorio','examenlaboratorio'),(8,'pacientes','paciente'),(9,'pacientes','registrobaja'),(10,'personal_medico','especialidad'),(12,'personal_medico','horariomedico'),(11,'personal_medico','medico'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-07-24 00:33:14.701655'),(2,'auth','0001_initial','2026-07-24 00:33:15.306146'),(3,'accounts','0001_initial','2026-07-24 00:33:15.364695'),(4,'admin','0001_initial','2026-07-24 00:33:15.477878'),(5,'admin','0002_logentry_remove_auto_add','2026-07-24 00:33:15.487418'),(6,'admin','0003_logentry_add_action_flag_choices','2026-07-24 00:33:15.497970'),(7,'contenttypes','0002_remove_content_type_name','2026-07-24 00:33:15.596587'),(8,'auth','0002_alter_permission_name_max_length','2026-07-24 00:33:15.646300'),(9,'auth','0003_alter_user_email_max_length','2026-07-24 00:33:15.673239'),(10,'auth','0004_alter_user_username_opts','2026-07-24 00:33:15.686114'),(11,'auth','0005_alter_user_last_login_null','2026-07-24 00:33:15.732700'),(12,'auth','0006_require_contenttypes_0002','2026-07-24 00:33:15.735957'),(13,'auth','0007_alter_validators_add_error_messages','2026-07-24 00:33:15.746398'),(14,'auth','0008_alter_user_username_max_length','2026-07-24 00:33:15.815673'),(15,'auth','0009_alter_user_last_name_max_length','2026-07-24 00:33:15.878251'),(16,'auth','0010_alter_group_name_max_length','2026-07-24 00:33:15.910212'),(17,'auth','0011_update_proxy_permissions','2026-07-24 00:33:15.941224'),(18,'auth','0012_alter_user_first_name_max_length','2026-07-24 00:33:16.030806'),(19,'sessions','0001_initial','2026-07-24 00:33:16.059837');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergencia`
--

DROP TABLE IF EXISTS `emergencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergencia` (
  `id_emergencia` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `id_medico_guardia` int NOT NULL,
  `fecha_hora_ingreso` datetime NOT NULL,
  `nivel_triage` enum('Rojo','Naranja','Amarillo','Verde','Azul') COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_urgencia` text COLLATE utf8mb4_unicode_ci,
  `destino_paciente` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_emergencia`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_medico_guardia` (`id_medico_guardia`),
  CONSTRAINT `emergencia_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `emergencia_ibfk_2` FOREIGN KEY (`id_medico_guardia`) REFERENCES `medico` (`id_medico`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergencia`
--

LOCK TABLES `emergencia` WRITE;
/*!40000 ALTER TABLE `emergencia` DISABLE KEYS */;
INSERT INTO `emergencia` VALUES (1,11,3,'2026-07-23 16:14:12','Amarillo','Dolor agudo en la espalda por caída','Traumatología'),(2,12,1,'2026-07-23 20:14:12','Naranja','Dificultad respiratoria severa','Terapia Intensiva');
/*!40000 ALTER TABLE `emergencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidad`
--

DROP TABLE IF EXISTS `especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidad` (
  `id_especialidad` int NOT NULL AUTO_INCREMENT,
  `nombre_especialidad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_especialidad`),
  UNIQUE KEY `nombre_especialidad` (`nombre_especialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidad`
--

LOCK TABLES `especialidad` WRITE;
/*!40000 ALTER TABLE `especialidad` DISABLE KEYS */;
INSERT INTO `especialidad` VALUES (4,'Cardiología'),(7,'Dermatología'),(5,'Ginecología'),(1,'Medicina General'),(6,'Neurología'),(2,'Pediatría'),(3,'Traumatología');
/*!40000 ALTER TABLE `especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `examen_laboratorio`
--

DROP TABLE IF EXISTS `examen_laboratorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `examen_laboratorio` (
  `id_examen` int NOT NULL AUTO_INCREMENT,
  `id_historial` int NOT NULL,
  `tipo_examen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicaciones_medicas` text COLLATE utf8mb4_unicode_ci,
  `resultado_texto` text COLLATE utf8mb4_unicode_ci,
  `estado_examen` enum('Pendiente','En Proceso','Completado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `costo_examen` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_examen`),
  KEY `id_historial` (`id_historial`),
  CONSTRAINT `examen_laboratorio_ibfk_1` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `examen_laboratorio`
--

LOCK TABLES `examen_laboratorio` WRITE;
/*!40000 ALTER TABLE `examen_laboratorio` DISABLE KEYS */;
/*!40000 ALTER TABLE `examen_laboratorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `id_historial` int DEFAULT NULL,
  `id_hospitalizacion` int DEFAULT NULL,
  `id_impuesto` int NOT NULL,
  `nit_factura` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razon_social` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `monto_impuesto` decimal(10,2) NOT NULL,
  `total_pagar` decimal(10,2) GENERATED ALWAYS AS ((`subtotal` + `monto_impuesto`)) STORED,
  `estado_pago` enum('Pendiente','Parcial','Pagado','Anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cajero_responsable` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_historial` (`id_historial`),
  KEY `id_hospitalizacion` (`id_hospitalizacion`),
  KEY `id_impuesto` (`id_impuesto`),
  KEY `idx_factura_estado_pago` (`estado_pago`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`),
  CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`id_hospitalizacion`) REFERENCES `hospitalizacion` (`id_hospitalizacion`),
  CONSTRAINT `factura_ibfk_3` FOREIGN KEY (`id_impuesto`) REFERENCES `config_impuesto` (`id_impuesto`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
INSERT INTO `factura` (`id_factura`, `id_historial`, `id_hospitalizacion`, `id_impuesto`, `nit_factura`, `razon_social`, `subtotal`, `monto_impuesto`, `estado_pago`, `fecha_emision`, `cajero_responsable`) VALUES (1,1,NULL,1,'6012345010','Carlos Mamani',150.00,19.50,'Pagado','2026-07-23 21:14:12','Roberto Rojas'),(2,2,NULL,1,'6023456015','Laura Quispe',200.00,26.00,'Pagado','2026-07-23 21:14:12','Roberto Rojas'),(3,3,NULL,1,'6034567020','Roberto Condori',250.00,32.50,'Pendiente','2026-07-23 21:14:12','Roberto Rojas');
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_auditoria_factura_update` AFTER UPDATE ON `factura` FOR EACH ROW BEGIN
    IF NEW.estado_pago <> OLD.estado_pago THEN INSERT INTO AUDITORIA_SISTEMA (usuario_accion, tabla_afectada, id_registro_afectado, tipo_operacion, valores_anteriores, valores_nuevos) VALUES (IFNULL(NEW.cajero_responsable, 'desconocido'), 'FACTURA', NEW.id_factura, 'EDICION', CONCAT('estado_pago=', OLD.estado_pago), CONCAT('estado_pago=', NEW.estado_pago)); END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `factura_detalle`
--

DROP TABLE IF EXISTS `factura_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura_detalle` (
  `id_factura_detalle` int NOT NULL AUTO_INCREMENT,
  `id_factura` int NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal_linea` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  PRIMARY KEY (`id_factura_detalle`),
  KEY `id_factura` (`id_factura`),
  CONSTRAINT `factura_detalle_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura_detalle`
--

LOCK TABLES `factura_detalle` WRITE;
/*!40000 ALTER TABLE `factura_detalle` DISABLE KEYS */;
INSERT INTO `factura_detalle` (`id_factura_detalle`, `id_factura`, `concepto`, `cantidad`, `precio_unitario`) VALUES (1,1,'Consulta Medicina General',1,100.00),(2,1,'Paracetamol x10',10,5.00),(3,2,'Consulta Pediatría',1,150.00),(4,2,'Omeprazol x5',5,10.00),(5,3,'Consulta Cardiología',1,250.00);
/*!40000 ALTER TABLE `factura_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_clinico`
--

DROP TABLE IF EXISTS `historial_clinico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_clinico` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_cita` int DEFAULT NULL,
  `id_hospitalizacion` int DEFAULT NULL,
  `id_emergencia` int DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci,
  `tratamiento` text COLLATE utf8mb4_unicode_ci,
  `id_cie10` int DEFAULT NULL,
  `diagnostico` text COLLATE utf8mb4_unicode_ci,
  `medico_tratante` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_cita` (`id_cita`),
  KEY `id_hospitalizacion` (`id_hospitalizacion`),
  KEY `id_emergencia` (`id_emergencia`),
  KEY `id_cie10` (`id_cie10`),
  CONSTRAINT `historial_clinico_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`),
  CONSTRAINT `historial_clinico_ibfk_2` FOREIGN KEY (`id_hospitalizacion`) REFERENCES `hospitalizacion` (`id_hospitalizacion`),
  CONSTRAINT `historial_clinico_ibfk_3` FOREIGN KEY (`id_emergencia`) REFERENCES `emergencia` (`id_emergencia`),
  CONSTRAINT `historial_clinico_ibfk_4` FOREIGN KEY (`id_cie10`) REFERENCES `catalogo_cie10` (`id_cie10`),
  CONSTRAINT `historial_clinico_chk_1` CHECK (((`id_cita` is not null) or (`id_hospitalizacion` is not null) or (`id_emergencia` is not null)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_clinico`
--

LOCK TABLES `historial_clinico` WRITE;
/*!40000 ALTER TABLE `historial_clinico` DISABLE KEYS */;
INSERT INTO `historial_clinico` VALUES (1,1,NULL,NULL,'2026-07-21 00:00:00','Dolor de cabeza y fiebre leve','Tomar paracetamol y reposo',1,'Resfriado común','Dr. Juan Perez'),(2,2,NULL,NULL,'2026-07-22 00:00:00','Dolor estomacal y náuseas','Dieta blanda y omeprazol',2,'Gastroenteritis','Dra. Maria Gomez'),(3,3,NULL,NULL,'2026-07-23 00:00:00','Control de presión arterial alta','Ajuste de dosis de Losartán',3,'Hipertensión esencial','Dra. Elena Vargas');
/*!40000 ALTER TABLE `historial_clinico` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_auditoria_historial_update` AFTER UPDATE ON `historial_clinico` FOR EACH ROW BEGIN
    INSERT INTO AUDITORIA_SISTEMA (usuario_accion, tabla_afectada, id_registro_afectado, tipo_operacion, valores_anteriores, valores_nuevos) VALUES (IFNULL(NEW.medico_tratante, 'desconocido'), 'HISTORIAL_CLINICO', NEW.id_historial, 'EDICION', CONCAT('diagnostico=', OLD.diagnostico, '; tratamiento=', OLD.tratamiento), CONCAT('diagnostico=', NEW.diagnostico, '; tratamiento=', NEW.tratamiento));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `horario_medico`
--

DROP TABLE IF EXISTS `horario_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario_medico` (
  `id_horario` int NOT NULL AUTO_INCREMENT,
  `id_medico` int NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `estado_turno` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_horario`),
  KEY `id_medico` (`id_medico`),
  CONSTRAINT `horario_medico_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`),
  CONSTRAINT `horario_medico_chk_1` CHECK ((`hora_fin` > `hora_inicio`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horario_medico`
--

LOCK TABLES `horario_medico` WRITE;
/*!40000 ALTER TABLE `horario_medico` DISABLE KEYS */;
/*!40000 ALTER TABLE `horario_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitalizacion`
--

DROP TABLE IF EXISTS `hospitalizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitalizacion` (
  `id_hospitalizacion` int NOT NULL AUTO_INCREMENT,
  `id_cita` int DEFAULT NULL,
  `id_emergencia` int DEFAULT NULL,
  `id_paciente` int NOT NULL,
  `id_medico_responsable` int NOT NULL,
  `id_cama` int NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `fecha_egreso` datetime DEFAULT NULL,
  `diagnostico_ingreso` text COLLATE utf8mb4_unicode_ci,
  `estado_internacion` enum('Activo','Alta','Trasladado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_hospitalizacion`),
  KEY `id_cita` (`id_cita`),
  KEY `id_emergencia` (`id_emergencia`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_medico_responsable` (`id_medico_responsable`),
  KEY `id_cama` (`id_cama`),
  KEY `idx_hospitalizacion_estado` (`estado_internacion`),
  CONSTRAINT `hospitalizacion_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`),
  CONSTRAINT `hospitalizacion_ibfk_2` FOREIGN KEY (`id_emergencia`) REFERENCES `emergencia` (`id_emergencia`),
  CONSTRAINT `hospitalizacion_ibfk_3` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `hospitalizacion_ibfk_4` FOREIGN KEY (`id_medico_responsable`) REFERENCES `medico` (`id_medico`),
  CONSTRAINT `hospitalizacion_ibfk_5` FOREIGN KEY (`id_cama`) REFERENCES `cama` (`id_cama`),
  CONSTRAINT `hospitalizacion_chk_1` CHECK (((`fecha_egreso` is null) or (`fecha_egreso` >= `fecha_ingreso`)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitalizacion`
--

LOCK TABLES `hospitalizacion` WRITE;
/*!40000 ALTER TABLE `hospitalizacion` DISABLE KEYS */;
INSERT INTO `hospitalizacion` VALUES (1,NULL,1,11,3,5,'2026-07-23 17:14:12',NULL,'Dorsalgia post-traumática','Activo'),(2,NULL,2,12,1,7,'2026-07-23 20:44:12',NULL,'Insuficiencia respiratoria','Activo');
/*!40000 ALTER TABLE `hospitalizacion` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_hospitalizacion_ocupa_cama` BEFORE INSERT ON `hospitalizacion` FOR EACH ROW BEGIN
    DECLARE v_estado_cama VARCHAR(20);
    SELECT estado_cama INTO v_estado_cama FROM CAMA WHERE id_cama = NEW.id_cama;
    IF v_estado_cama <> 'Disponible' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cama seleccionada no está disponible'; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_hospitalizacion_marca_ocupada` AFTER INSERT ON `hospitalizacion` FOR EACH ROW BEGIN
    UPDATE CAMA SET estado_cama = 'Ocupada' WHERE id_cama = NEW.id_cama;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_hospitalizacion_libera_cama` AFTER UPDATE ON `hospitalizacion` FOR EACH ROW BEGIN
    IF NEW.fecha_egreso IS NOT NULL AND OLD.fecha_egreso IS NULL THEN UPDATE CAMA SET estado_cama = 'Disponible' WHERE id_cama = NEW.id_cama; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `lote_medicamento`
--

DROP TABLE IF EXISTS `lote_medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote_medicamento` (
  `id_lote` int NOT NULL AUTO_INCREMENT,
  `id_medicamento` int NOT NULL,
  `id_compra` int DEFAULT NULL,
  `numero_lote` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_actual` int NOT NULL,
  `precio_compra_unitario` decimal(10,2) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  PRIMARY KEY (`id_lote`),
  KEY `id_medicamento` (`id_medicamento`),
  KEY `id_compra` (`id_compra`),
  KEY `idx_lote_vencimiento` (`fecha_vencimiento`),
  CONSTRAINT `lote_medicamento_ibfk_1` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`),
  CONSTRAINT `lote_medicamento_ibfk_2` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`),
  CONSTRAINT `lote_medicamento_chk_1` CHECK ((`cantidad_actual` >= 0)),
  CONSTRAINT `lote_medicamento_chk_2` CHECK ((`cantidad_actual` <= `cantidad_inicial`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote_medicamento`
--

LOCK TABLES `lote_medicamento` WRITE;
/*!40000 ALTER TABLE `lote_medicamento` DISABLE KEYS */;
INSERT INTO `lote_medicamento` VALUES (1,1,1,'L-P01',500,500,1.00,'2026-07-13','2028-01-01'),(2,2,1,'L-I01',300,300,2.00,'2026-07-13','2027-06-15'),(3,3,1,'L-A01',200,200,3.50,'2026-07-13','2026-12-30'),(4,4,2,'L-L01',400,400,2.00,'2026-07-18','2029-03-20'),(5,5,2,'L-O01',350,350,1.50,'2026-07-18','2028-11-10'),(6,6,2,'L-M01',250,250,1.20,'2026-07-18','2027-08-05');
/*!40000 ALTER TABLE `lote_medicamento` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_lote_incrementa_stock` AFTER INSERT ON `lote_medicamento` FOR EACH ROW BEGIN
    UPDATE MEDICAMENTO SET stock_actual = stock_actual + NEW.cantidad_inicial WHERE id_medicamento = NEW.id_medicamento;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `medicamento`
--

DROP TABLE IF EXISTS `medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamento` (
  `id_medicamento` int NOT NULL AUTO_INCREMENT,
  `nombre_comercial` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock_actual` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_medicamento`),
  CONSTRAINT `medicamento_chk_1` CHECK ((`stock_actual` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamento`
--

LOCK TABLES `medicamento` WRITE;
/*!40000 ALTER TABLE `medicamento` DISABLE KEYS */;
INSERT INTO `medicamento` VALUES (1,'Paracetamol 500mg',500,100,2.00),(2,'Ibuprofeno 400mg',300,50,3.50),(3,'Amoxicilina 500mg',200,30,5.00),(4,'Losartán 50mg',400,40,4.00),(5,'Omeprazol 20mg',350,50,3.00),(6,'Metformina 850mg',250,40,2.50),(7,'Vitamina C 1g',0,20,8.00),(8,'Diclofenaco 50mg',0,60,2.00),(9,'Azitromicina 500mg',0,20,15.00),(10,'Cetirizina 10mg',0,30,1.50);
/*!40000 ALTER TABLE `medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico`
--

DROP TABLE IF EXISTS `medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico` (
  `id_medico` int NOT NULL AUTO_INCREMENT,
  `nombre_medico` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_especialidad` int NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_medico`),
  KEY `id_especialidad` (`id_especialidad`),
  CONSTRAINT `medico_ibfk_1` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidad` (`id_especialidad`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico`
--

LOCK TABLES `medico` WRITE;
/*!40000 ALTER TABLE `medico` DISABLE KEYS */;
INSERT INTO `medico` VALUES (1,'Dr. Juan Perez',1,'71111111'),(2,'Dra. Maria Gomez',2,'72222222'),(3,'Dr. Carlos Rojas',3,'73333333'),(4,'Dra. Elena Vargas',4,'74444444'),(5,'Dr. Marcos Lima',5,'75555555'),(6,'Dra. Sofia Pinto',6,'76666666');
/*!40000 ALTER TABLE `medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id_paciente` int NOT NULL AUTO_INCREMENT,
  `cedula_paciente` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seguro_medico` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alergias` text COLLATE utf8mb4_unicode_ci,
  `estado_baja` enum('Activo','Baja') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `cedula_paciente` (`cedula_paciente`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES (1,'6012345','Carlos','Mamani','1985-04-12','79010001','Miraflores, La Paz','Caja Nacional',NULL,'Activo'),(2,'6023456','Laura','Quispe','1992-07-25','79010002','El Alto, Ciudad Satélite','Seguro Universal',NULL,'Activo'),(3,'6034567','Roberto','Condori','1978-11-05','79010003','Obrajes, La Paz','Ninguno',NULL,'Activo'),(4,'6045678','Sofia','Vargas','2005-02-14','79010004','Sopocachi, La Paz','Caja Petrolera',NULL,'Activo'),(5,'6056789','Fernando','Torres','1965-09-30','79010005','Zona Sur, La Paz','Ninguno',NULL,'Activo'),(6,'6067890','Andrea','Flores','1998-03-18','79010006','Villa Copacabana, La Paz','Seguro Universal',NULL,'Activo'),(7,'6078901','Luis','Guzman','1982-12-01','79010007','Achumani, La Paz','Caja Nacional',NULL,'Activo'),(8,'6089012','Carmen','Salazar','1970-08-22','79010008','Irpavi, La Paz','Caja Bancaria',NULL,'Activo'),(9,'6090123','Hugo','Morales','1995-05-10','79010009','Centro, La Paz','Ninguno',NULL,'Activo'),(10,'6101234','Patricia','Luna','2010-11-20','79010010','Bolognia, La Paz','Seguro Universal',NULL,'Activo'),(11,'6112345','Jorge','Rios','1955-01-15','79010011','Tembladerani, La Paz','Caja Nacional',NULL,'Activo'),(12,'6123456','Monica','Blanco','1988-06-08','79010012','Pampahasi, La Paz','Ninguno',NULL,'Activo'),(13,'6134567','Raul','Nina','1991-09-17','79010013','El Alto, 16 de Julio','Seguro Universal',NULL,'Activo'),(14,'6145678','Teresa','Cruz','1975-04-04','79010014','San Pedro, La Paz','Caja Nacional',NULL,'Activo'),(15,'6156789','Victor','Paz','2001-10-30','79010015','Cota Cota, La Paz','Ninguno',NULL,'Activo');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_factura` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('Efectivo','Tarjeta','Transferencia','Seguro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cajero_responsable` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `id_factura` (`id_factura`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`),
  CONSTRAINT `pago_chk_1` CHECK ((`monto` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,1,169.50,'Efectivo','2026-07-23 21:14:12','Roberto Rojas'),(2,2,100.00,'Tarjeta','2026-07-23 21:14:12','Roberto Rojas'),(3,2,126.00,'Efectivo','2026-07-23 21:14:12','Roberto Rojas');
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_pago_actualiza_factura` AFTER INSERT ON `pago` FOR EACH ROW BEGIN
    DECLARE v_total_pagado DECIMAL(10,2); DECLARE v_total_factura DECIMAL(10,2);
    SELECT IFNULL(SUM(monto), 0) INTO v_total_pagado FROM PAGO WHERE id_factura = NEW.id_factura;
    SELECT total_pagar INTO v_total_factura FROM FACTURA WHERE id_factura = NEW.id_factura;
    IF v_total_pagado >= v_total_factura THEN UPDATE FACTURA SET estado_pago = 'Pagado' WHERE id_factura = NEW.id_factura; ELSE UPDATE FACTURA SET estado_pago = 'Parcial' WHERE id_factura = NEW.id_factura; END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre_proveedor` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit_proveedor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Droguería INTI','10203040','2223344','Av. Saavedra, La Paz'),(2,'Laboratorios Bagó','50607080','2225566','Calacoto, La Paz'),(3,'Laboratorios Cofar','90807060','2112233','Villa Fátima, La Paz');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_detalle`
--

DROP TABLE IF EXISTS `receta_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta_detalle` (
  `id_detalle_receta` int NOT NULL AUTO_INCREMENT,
  `id_historial` int NOT NULL,
  `id_medicamento` int NOT NULL,
  `cantidad_recetada` int NOT NULL,
  `dosis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_despacho` enum('Pendiente','Entregado','Sin Stock') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`id_detalle_receta`),
  KEY `id_historial` (`id_historial`),
  KEY `id_medicamento` (`id_medicamento`),
  CONSTRAINT `receta_detalle_ibfk_1` FOREIGN KEY (`id_historial`) REFERENCES `historial_clinico` (`id_historial`),
  CONSTRAINT `receta_detalle_ibfk_2` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_detalle`
--

LOCK TABLES `receta_detalle` WRITE;
/*!40000 ALTER TABLE `receta_detalle` DISABLE KEYS */;
INSERT INTO `receta_detalle` VALUES (1,1,1,10,'500mg','Cada 8 horas','3 días','Pendiente'),(2,2,5,5,'20mg','Cada 12 horas','5 días','Pendiente'),(3,3,4,30,'50mg','1 diaria','1 mes','Pendiente');
/*!40000 ALTER TABLE `receta_detalle` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_receta_descuenta_stock` AFTER UPDATE ON `receta_detalle` FOR EACH ROW BEGIN
    IF NEW.estado_despacho = 'Entregado' AND OLD.estado_despacho != 'Entregado' THEN CALL sp_descontar_stock_fifo(NEW.id_medicamento, NEW.cantidad_recetada); END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `registro_baja`
--

DROP TABLE IF EXISTS `registro_baja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_baja` (
  `id_baja` int NOT NULL AUTO_INCREMENT,
  `id_paciente` int NOT NULL,
  `fecha_baja` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo_baja` text COLLATE utf8mb4_unicode_ci,
  `usuario_autoriza` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_baja`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `registro_baja_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_baja`
--

LOCK TABLES `registro_baja` WRITE;
/*!40000 ALTER TABLE `registro_baja` DISABLE KEYS */;
/*!40000 ALTER TABLE `registro_baja` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_baja_actualiza_paciente` AFTER INSERT ON `registro_baja` FOR EACH ROW BEGIN
    UPDATE PACIENTE SET estado_baja = 'Baja' WHERE id_paciente = NEW.id_paciente;
    INSERT INTO AUDITORIA_SISTEMA (usuario_accion, tabla_afectada, id_registro_afectado, tipo_operacion, valores_nuevos) VALUES (NEW.usuario_autoriza, 'PACIENTE', NEW.id_paciente, 'EDICION', CONCAT('estado_baja=Baja; motivo=', NEW.motivo_baja));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tarifa_habitacion`
--

DROP TABLE IF EXISTS `tarifa_habitacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifa_habitacion` (
  `id_tarifa` int NOT NULL AUTO_INCREMENT,
  `tipo_habitacion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `costo_por_dia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_tarifa`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifa_habitacion`
--

LOCK TABLES `tarifa_habitacion` WRITE;
/*!40000 ALTER TABLE `tarifa_habitacion` DISABLE KEYS */;
INSERT INTO `tarifa_habitacion` VALUES (1,'Sala Común',200.00),(2,'Habitación Compartida',300.00),(3,'Habitación Privada',500.00),(4,'Terapia Intensiva (UTI)',1500.00);
/*!40000 ALTER TABLE `tarifa_habitacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'db_clinica_siih'
--

--
-- Dumping routines for database 'db_clinica_siih'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_descontar_stock_fifo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_descontar_stock_fifo`(IN p_id_medicamento INT, IN p_cantidad INT)
proc_block: BEGIN
    DECLARE v_id_lote INT; DECLARE v_disponible INT; DECLARE v_restante INT DEFAULT p_cantidad;
    DECLARE v_tomar INT; DECLARE v_done INT DEFAULT 0; DECLARE v_stock_total INT;
    SELECT stock_actual INTO v_stock_total FROM MEDICAMENTO WHERE id_medicamento = p_id_medicamento;
    IF v_stock_total < p_cantidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para despachar la receta';
    END IF;
    BEGIN
        DECLARE cur CURSOR FOR SELECT id_lote, cantidad_actual FROM LOTE_MEDICAMENTO WHERE id_medicamento = p_id_medicamento AND cantidad_actual > 0 ORDER BY fecha_vencimiento ASC;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_id_lote, v_disponible;
            IF v_done = 1 OR v_restante <= 0 THEN LEAVE read_loop; END IF;
            IF v_disponible >= v_restante THEN SET v_tomar = v_restante; ELSE SET v_tomar = v_disponible; END IF;
            UPDATE LOTE_MEDICAMENTO SET cantidad_actual = cantidad_actual - v_tomar WHERE id_lote = v_id_lote;
            SET v_restante = v_restante - v_tomar;
        END LOOP;
        CLOSE cur;
    END;
    UPDATE MEDICAMENTO SET stock_actual = stock_actual - p_cantidad WHERE id_medicamento = p_id_medicamento;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-23 21:53:47
