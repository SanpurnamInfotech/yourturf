-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: turf
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add turf',7,'add_turf'),(26,'Can change turf',7,'change_turf'),(27,'Can delete turf',7,'delete_turf'),(28,'Can view turf',7,'view_turf'),(29,'Can add booking',8,'add_booking'),(30,'Can change booking',8,'change_booking'),(31,'Can delete booking',8,'delete_booking'),(32,'Can view booking',8,'view_booking'),(33,'Can add slot',9,'add_slot'),(34,'Can change slot',9,'change_slot'),(35,'Can delete slot',9,'delete_slot'),(36,'Can view slot',9,'view_slot'),(37,'Can add booking slot',10,'add_bookingslot'),(38,'Can change booking slot',10,'change_bookingslot'),(39,'Can delete booking slot',10,'delete_bookingslot'),(40,'Can view booking slot',10,'view_bookingslot'),(41,'Can add turf image',11,'add_turfimage'),(42,'Can change turf image',11,'change_turfimage'),(43,'Can delete turf image',11,'delete_turfimage'),(44,'Can view turf image',11,'view_turfimage'),(45,'Can add Turf Settings',12,'add_turfsettings'),(46,'Can change Turf Settings',12,'change_turfsettings'),(47,'Can delete Turf Settings',12,'delete_turfsettings'),(48,'Can view Turf Settings',12,'view_turfsettings'),(49,'Can add holiday',13,'add_holiday'),(50,'Can change holiday',13,'change_holiday'),(51,'Can delete holiday',13,'delete_holiday'),(52,'Can view holiday',13,'view_holiday'),(53,'Can add turf closure',14,'add_turfclosure'),(54,'Can change turf closure',14,'change_turfclosure'),(55,'Can delete turf closure',14,'delete_turfclosure'),(56,'Can view turf closure',14,'view_turfclosure');
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
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$1200000$7E3G5pVAjZ3QbVkNSrKBAd$CQsKBhj4JKtDqnQieumo1ZVQ7Lnh4GkcD8PiIgbTSu8=','2026-06-23 07:35:28.264733',1,'admin','','','admin@gmail.com',1,1,'2026-06-23 07:14:34.840450'),(2,'pbkdf2_sha256$600000$cOxeGp8uwHkhJ8uMRzxXDy$xFKUn+lt2GLF1ehdscPL7z8D1cxeIG3PCw1xnFxFOTE=',NULL,1,'sahil','','','sahil@gmail.com',1,1,'2026-06-23 18:14:43.447021'),(3,'pbkdf2_sha256$600000$k8rqgGJiSE3ptcjWSS7yFz$IoMpvljr9dzl0G485OtoJTnzhbR3T0OcT82qogLK4FI=',NULL,1,'hp','','','admin@gmail.com',1,1,'2026-08-11 13:40:46.561858'),(4,'pbkdf2_sha256$600000$p3YOxiaEooiCNM0qeVrTK7$25ELdtf1ySqMyqEXQ6d1BUG7ay+RorXQSL9XJgZNzy0=','2026-08-11 13:44:57.868299',1,'admin1','','','admin@gmail.com',1,1,'2026-08-11 13:44:30.892292');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_booking`
--

DROP TABLE IF EXISTS `bookings_booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `email` varchar(254) NOT NULL,
  `booking_date` date NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `created_on` datetime(6) NOT NULL,
  `status` varchar(20) NOT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `payment_method` varchar(30) DEFAULT NULL,
  `payment_status` varchar(20) NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `order_id` varchar(100) DEFAULT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_booking`
--

LOCK TABLES `bookings_booking` WRITE;
/*!40000 ALTER TABLE `bookings_booking` DISABLE KEYS */;
INSERT INTO `bookings_booking` VALUES (2,'TBEC7C6E','demo1','0987654321','demo1@gmail.com','2026-06-27',3000.00,'2026-06-23 12:17:31.531228','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(3,'TB8387D7','asd','2345609876','dae@gmail.com','2026-06-27',2000.00,'2026-06-23 12:26:53.121744','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(4,'TB91CCFD','hero','1230987654','hrero@gmail.com','2026-06-28',2000.00,'2026-06-23 15:24:20.270734','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(6,'TBDEFAF3','ew','1234','sa@gmail.com','2026-06-25',3000.00,'2026-06-23 20:13:51.692599','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(7,'TB5D1D25','dsa','123456','sas@gmail.com','2026-06-28',2000.00,'2026-06-24 07:31:04.086675','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(9,'TB2082F0','asdf','1234509876','dsa@gmail.com','2026-06-25',2800.00,'2026-06-24 08:09:31.085064','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(10,'TBE9745F','Sahil Gadkari','0987654312','sahil@gmail.com','2026-06-27',2000.00,'2026-06-24 19:18:03.348821','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(11,'TB600D87','fds','8900000056','asd@gmail.com','2026-07-01',2000.00,'2026-06-24 19:26:51.745044','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(12,'TB05D476','asd','1234567098','asd@gmail.com','2026-06-28',1800.00,'2026-06-25 07:17:06.858548','Cancelled',NULL,NULL,'Pending',NULL,NULL,NULL),(13,'TB9AFFFF','mnb','6543217890','mnb@gmail.com','2026-06-28',2000.00,'2026-06-25 07:28:04.844704','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(14,'','sahil','1234567891','demo@gmail.com','2026-07-01',2000.00,'2026-06-29 05:03:23.309945','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(20,'DTDB1DE2','duo','1233211234','duo@gmail.com','2026-07-01',2800.00,'2026-06-29 06:07:21.754355','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(21,'DTF1FB55','mnb','1212121212','mnb2@gmail.com','2026-07-01',2000.00,'2026-06-29 06:10:49.164569','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(22,'DTD219AF','zxc','9898989898','zxc@gmail.com','2026-07-01',2000.00,'2026-06-29 06:40:56.719758','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(23,'DT8099EC','rew','1221212121','asd@gmail.com','2026-07-01',1000.00,'2026-06-29 07:00:41.808118','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(24,'DT069452','asdf','5345454545','gfds@gmail.com','2026-07-01',1000.00,'2026-06-29 12:45:02.532977','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(25,'DT92CC1C','xfdd','1232123212','zds@gmail.com','2026-06-30',1000.00,'2026-06-29 12:46:17.717437','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(26,'DT83B812','asd','6556565434','sdcf@gmail.com','2026-07-02',800.00,'2026-06-29 12:55:33.824524','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(27,'DT337965','asdf','1254321234','asdfg@gmail.com','2026-06-30',1800.00,'2026-06-30 17:22:35.058311','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(28,'DT1BEE94','sa','0909090909','sa09@gmail.com','2026-07-03',800.00,'2026-07-03 10:54:40.967145','Cancelled',NULL,NULL,'Pending',NULL,NULL,NULL),(29,'DT98A90E','Sahil Rajendra Gadkari','9322605245','2122sahilgadkari@gmail.com','2026-07-11',2000.00,'2026-07-03 17:23:13.171341','Cancelled',NULL,NULL,'Pending',NULL,NULL,NULL),(30,'DTBFB341','hqvshwkjdh','1234567890','as@gmail.com','2026-07-11',2000.00,'2026-07-04 13:46:19.140990','Cancelled',NULL,NULL,'Pending',NULL,NULL,NULL),(31,'DTEC9345','sourbha','2345678123','gfd@gmail.com','2026-07-11',2000.00,'2026-07-04 18:57:42.153649','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(32,'DT22C397','zxcv','1234554333','dsa@gmail.com','2026-07-12',2000.00,'2026-07-10 16:51:17.457735','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(33,'DT04F5CE','asd','1234567890','asd12@gmail.com','2026-08-02',2000.00,'2026-08-01 17:35:35.310060','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(34,'DT9C9D2A','mnb','0909090909','mnb@gmail.com','2026-08-07',2000.00,'2026-08-06 16:40:30.075787','Completed',NULL,NULL,'Pending',NULL,NULL,NULL),(35,'DT6C31A2','demo','1212121212','demo12@gmail.com','2026-08-08',1.00,'2026-08-07 17:05:16.513608','Completed',NULL,NULL,'Pending',NULL,'order_TMrgBueo0CAWG3','pay_TMrhL4VeQELqbm'),(36,'DTCF55A7','aa','1111111111','aa@gmail.com','2026-08-14',1.00,'2026-08-10 12:53:40.692236','Completed',NULL,NULL,'Pending',NULL,'order_TNz0jDSJS0X8MN','pay_TNz0xFF5zzpTzQ'),(37,'DT0247B1','Sahil Rajendra Gadkari','9322605245','2122sahilgadkari@gmail.com','2026-09-01',1.00,'2026-08-28 14:25:00.342869','Completed','2026-08-28 14:25:00.342556','UPI','Paid','pay_TV8BZ4jBtFQZOg','order_TV8BGimexPwm7O','pay_TV8BZ4jBtFQZOg');
/*!40000 ALTER TABLE `bookings_booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_bookingslot`
--

DROP TABLE IF EXISTS `bookings_bookingslot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_bookingslot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `slot_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bookings_bookingslot_booking_id_f1d5b81d_fk` (`booking_id`),
  KEY `bookings_bookingslot_slot_id_fc8adfde_fk` (`slot_id`),
  CONSTRAINT `bookings_bookingslot_booking_id_f1d5b81d_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings_booking` (`id`),
  CONSTRAINT `bookings_bookingslot_slot_id_fc8adfde_fk` FOREIGN KEY (`slot_id`) REFERENCES `bookings_slot` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_bookingslot`
--

LOCK TABLES `bookings_bookingslot` WRITE;
/*!40000 ALTER TABLE `bookings_bookingslot` DISABLE KEYS */;
INSERT INTO `bookings_bookingslot` VALUES (3,2,14),(4,2,15),(5,2,16),(6,3,21),(7,3,20),(8,4,18),(9,4,20),(11,6,24),(12,6,23),(13,6,22),(14,7,21),(15,7,22),(17,9,17),(18,9,19),(19,9,18),(20,10,22),(21,10,23),(22,11,21),(23,11,20),(26,13,24),(27,13,23),(28,14,22),(29,14,23),(30,20,18),(31,20,17),(32,20,19),(33,21,24),(34,21,1),(35,22,2),(36,22,3),(37,23,4),(38,24,5),(39,25,1),(40,26,17),(41,27,2),(42,27,3),(48,31,20),(49,31,19),(50,32,1),(51,32,2),(52,33,2),(53,33,4),(54,34,1),(55,34,2),(56,35,1),(57,36,3),(58,37,24);
/*!40000 ALTER TABLE `bookings_bookingslot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_slot`
--

DROP TABLE IF EXISTS `bookings_slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_slot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_slot`
--

LOCK TABLES `bookings_slot` WRITE;
/*!40000 ALTER TABLE `bookings_slot` DISABLE KEYS */;
INSERT INTO `bookings_slot` VALUES (1,'00:00:00.000000','01:00:00.000000'),(2,'01:00:00.000000','02:00:00.000000'),(3,'02:00:00.000000','03:00:00.000000'),(4,'03:00:00.000000','04:00:00.000000'),(5,'04:00:00.000000','05:00:00.000000'),(6,'05:00:00.000000','06:00:00.000000'),(7,'06:00:00.000000','07:00:00.000000'),(8,'07:00:00.000000','08:00:00.000000'),(9,'08:00:00.000000','09:00:00.000000'),(10,'09:00:00.000000','10:00:00.000000'),(11,'10:00:00.000000','11:00:00.000000'),(12,'11:00:00.000000','12:00:00.000000'),(13,'12:00:00.000000','13:00:00.000000'),(14,'13:00:00.000000','14:00:00.000000'),(15,'14:00:00.000000','15:00:00.000000'),(16,'15:00:00.000000','16:00:00.000000'),(17,'16:00:00.000000','17:00:00.000000'),(18,'17:00:00.000000','18:00:00.000000'),(19,'18:00:00.000000','19:00:00.000000'),(20,'19:00:00.000000','20:00:00.000000'),(21,'20:00:00.000000','21:00:00.000000'),(22,'21:00:00.000000','22:00:00.000000'),(23,'22:00:00.000000','23:00:00.000000'),(24,'23:00:00.000000','00:00:00.000000');
/*!40000 ALTER TABLE `bookings_slot` ENABLE KEYS */;
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
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2026-06-23 07:25:54.458448','1','Dream Turf',1,'[{\"added\": {}}]',7,1),(2,'2026-06-23 12:45:19.318077','1','turf_images/WhatsApp_Image_2026-03-13_at_1.32.45_PM_1.jpeg',1,'[{\"added\": {}}]',11,1),(3,'2026-06-23 12:51:10.416363','2','turf_images/turf.webp',1,'[{\"added\": {}}]',11,1),(4,'2026-06-23 12:51:53.281970','1','turf_images/WhatsApp_Image_2026-03-13_at_1.32.45_PM_1.jpeg',3,'',11,1),(5,'2026-06-23 12:52:58.535669','3','turf_images/turf1.webp',1,'[{\"added\": {}}]',11,1);
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
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(2,'auth','group'),(3,'auth','permission'),(4,'auth','user'),(8,'bookings','booking'),(10,'bookings','bookingslot'),(9,'bookings','slot'),(5,'contenttypes','contenttype'),(6,'sessions','session'),(13,'settings','holiday'),(12,'settings','turfsettings'),(7,'turf','turf'),(14,'turf','turfclosure'),(11,'turf','turfimage');
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
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-06-23 06:45:10.030119'),(2,'auth','0001_initial','2026-06-23 06:45:10.922162'),(3,'admin','0001_initial','2026-06-23 06:45:11.131450'),(4,'admin','0002_logentry_remove_auto_add','2026-06-23 06:45:11.142699'),(5,'admin','0003_logentry_add_action_flag_choices','2026-06-23 06:45:11.154278'),(6,'contenttypes','0002_remove_content_type_name','2026-06-23 06:45:11.318069'),(7,'auth','0002_alter_permission_name_max_length','2026-06-23 06:45:11.406070'),(8,'auth','0003_alter_user_email_max_length','2026-06-23 06:45:11.442141'),(9,'auth','0004_alter_user_username_opts','2026-06-23 06:45:11.457022'),(10,'auth','0005_alter_user_last_login_null','2026-06-23 06:45:11.556601'),(11,'auth','0006_require_contenttypes_0002','2026-06-23 06:45:11.559440'),(12,'auth','0007_alter_validators_add_error_messages','2026-06-23 06:45:11.570045'),(13,'auth','0008_alter_user_username_max_length','2026-06-23 06:45:11.658574'),(14,'auth','0009_alter_user_last_name_max_length','2026-06-23 06:45:11.751129'),(15,'auth','0010_alter_group_name_max_length','2026-06-23 06:45:11.780776'),(16,'auth','0011_update_proxy_permissions','2026-06-23 06:45:11.793610'),(17,'auth','0012_alter_user_first_name_max_length','2026-06-23 06:45:11.881328'),(18,'sessions','0001_initial','2026-06-23 06:45:11.924625'),(19,'bookings','0001_initial','2026-06-23 07:11:53.772584'),(20,'turf','0001_initial','2026-06-23 07:11:53.794936'),(21,'bookings','0002_slot_remove_booking_booking_status_bookingslot','2026-06-23 08:20:00.710236'),(22,'bookings','0003_alter_booking_booking_code','2026-06-23 10:17:50.393928'),(23,'bookings','0004_alter_booking_id_alter_bookingslot_id_alter_slot_id','2026-06-23 12:36:37.299348'),(24,'turf','0002_turfimage_alter_turf_id','2026-06-23 12:36:37.380381'),(25,'bookings','0005_alter_booking_mobile','2026-06-24 08:04:26.020691'),(26,'bookings','0006_booking_status_alter_booking_booking_code_and_more','2026-06-25 07:55:01.157930'),(27,'bookings','0007_alter_booking_booking_code','2026-06-29 06:13:33.386056'),(28,'settings','0001_initial','2026-06-30 11:57:12.435464'),(29,'bookings','0008_booking_payment_date_booking_payment_method_and_more','2026-07-03 17:41:37.537925'),(30,'settings','0002_holiday','2026-07-10 17:09:25.608751'),(31,'bookings','0009_booking_order_id_booking_payment_id','2026-08-07 16:45:18.664930'),(32,'turf','0003_turf_email','2026-08-11 15:49:37.278388'),(33,'turf','0004_turf_main_image','2026-08-13 10:38:30.581330'),(34,'turf','0005_turf_about_image','2026-08-13 11:33:09.576455'),(35,'turf','0006_remove_turf_price_per_hour','2026-08-13 12:46:13.800006'),(36,'turf','0007_turfclosure','2026-08-28 11:33:40.892714');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('4pppylo7xxlxqyxnqnuey1l2kqs014tr','.eJxVjMsOwiAQRf-FtSFT3rh07zcQBgapGkhKuzL-uzbpQrf3nHNfLMRtrWEbtIQ5szOb2Ol3w5ge1HaQ77HdOk-9rcuMfFf4QQe_9kzPy-H-HdQ46rdWDtBqIpekV0oUcNpKVZJHQlAg9YTFCGGzUdIhEHiK2pKxMWXI4Nj7A8qjN3U:1wbvTA:7DJNzOyl9ORtdK69pOHy6K9ThGkwEV5aOZIARW3ukgE','2026-07-07 07:22:52.419589'),('4u5bi7e9mbmkbntbr2ac9i3kbkk2cwft','.eJxVjMsOwiAUBf-FtSEFRMCle7-B3AdXqoYmpV0Z_12bdKHbMzPnpTKsS81rL3MeWZ3VUR1-NwR6lLYBvkO7TZqmtswj6k3RO-36OnF5Xnb376BCr9_aCZ8Yg6Q4MBnPAsknwmC9IzQ2FkGPNkWH4CwBDU5CxMQGUAw7r94fDT448w:1wthdR:Pu16u6wo9-OKRY07R1np6gC3PGUN-4qSsGku69pUvXU','2026-08-25 13:44:57.872778'),('gxrhu33puyukijew9eobmsyjg1ij1f2z','.eJxVjMsOwiAQRf-FtSFT3rh07zcQBgapGkhKuzL-uzbpQrf3nHNfLMRtrWEbtIQ5szOb2Ol3w5ge1HaQ77HdOk-9rcuMfFf4QQe_9kzPy-H-HdQ46rdWDtBqIpekV0oUcNpKVZJHQlAg9YTFCGGzUdIhEHiK2pKxMWXI4Nj7A8qjN3U:1wbvfM:Lq_arp9YmC-vE9TobCJiv-pzTR6GmKGUpMzeJ1tnJq0','2026-07-07 07:35:28.270812');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings_holiday`
--

DROP TABLE IF EXISTS `settings_holiday`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings_holiday` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `holiday_from` date NOT NULL,
  `holiday_to` date NOT NULL,
  `reason` varchar(200) NOT NULL,
  `created_on` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings_holiday`
--

LOCK TABLES `settings_holiday` WRITE;
/*!40000 ALTER TABLE `settings_holiday` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings_holiday` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings_turfsettings`
--

DROP TABLE IF EXISTS `settings_turfsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings_turfsettings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `day_price` decimal(10,2) NOT NULL,
  `night_price` decimal(10,2) NOT NULL,
  `holiday_from` date DEFAULT NULL,
  `holiday_to` date DEFAULT NULL,
  `holiday_reason` varchar(200) NOT NULL,
  `updated_on` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings_turfsettings`
--

LOCK TABLES `settings_turfsettings` WRITE;
/*!40000 ALTER TABLE `settings_turfsettings` DISABLE KEYS */;
INSERT INTO `settings_turfsettings` VALUES (1,1.00,1.00,'2026-08-27','2026-08-29','Due to tournament the turf will be closed.','2026-08-29 12:50:28.263753');
/*!40000 ALTER TABLE `settings_turfsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turf_turf`
--

DROP TABLE IF EXISTS `turf_turf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turf_turf` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `location` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(254) DEFAULT NULL,
  `main_image` varchar(100) DEFAULT NULL,
  `about_image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turf_turf`
--

LOCK TABLES `turf_turf` WRITE;
/*!40000 ALTER TABLE `turf_turf` DISABLE KEYS */;
INSERT INTO `turf_turf` VALUES (1,'Sanpurnam','Premium Cricket & Football Turf','Sangli, Maharashtra','9876543210','sahilturf@gmail.com','turf_main/turfhome_AVX1VQs.avif','turf_about/turflanding_wTsyH3z.avif');
/*!40000 ALTER TABLE `turf_turf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turf_turfclosure`
--

DROP TABLE IF EXISTS `turf_turfclosure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turf_turfclosure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `start_time` time(6) DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `is_full_day` tinyint(1) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `turf_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `turf_turfclosure_turf_id_a4fcc6e2_fk_turf_turf_id` (`turf_id`),
  CONSTRAINT `turf_turfclosure_turf_id_a4fcc6e2_fk_turf_turf_id` FOREIGN KEY (`turf_id`) REFERENCES `turf_turf` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turf_turfclosure`
--

LOCK TABLES `turf_turfclosure` WRITE;
/*!40000 ALTER TABLE `turf_turfclosure` DISABLE KEYS */;
INSERT INTO `turf_turfclosure` VALUES (2,'2026-09-02','18:00:00.000000','22:00:00.000000',0,'Private Match','2026-08-28 11:43:37.548046',1),(4,'2026-09-01','12:00:00.000000','23:00:00.000000',0,'','2026-08-28 12:24:30.980562',1),(5,'2026-08-30','02:00:00.000000','12:00:00.000000',0,'asach band ahe','2026-08-28 15:43:39.665376',1),(7,'2026-09-13',NULL,NULL,1,'','2026-09-02 15:56:27.394886',1),(8,'2026-09-03','09:00:00.000000','11:00:00.000000',0,'','2026-09-02 16:02:41.801689',1);
/*!40000 ALTER TABLE `turf_turfclosure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turf_turfimage`
--

DROP TABLE IF EXISTS `turf_turfimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turf_turfimage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` varchar(100) NOT NULL,
  `uploaded_on` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turf_turfimage`
--

LOCK TABLES `turf_turfimage` WRITE;
/*!40000 ALTER TABLE `turf_turfimage` DISABLE KEYS */;
INSERT INTO `turf_turfimage` VALUES (2,'turf_images/turf.webp','2026-06-23 12:51:10.415190'),(3,'turf_images/turf1.webp','2026-06-23 12:52:58.534714'),(12,'turf_images/turf2.jfif','2026-07-03 16:20:52.714059'),(13,'turf_images/turf3.webp','2026-07-03 16:23:04.807104'),(14,'turf_images/turf4.jpg','2026-07-03 16:25:28.474441'),(15,'turf_images/turf5.jpg','2026-07-03 16:49:03.016263'),(16,'turf_images/turf6.avif','2026-07-03 16:50:26.218124');
/*!40000 ALTER TABLE `turf_turfimage` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-21 16:45:56
