-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: collegedb
-- ------------------------------------------------------
-- Server version	8.0.41

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

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `college_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `preferred_course` varchar(100) NOT NULL,
  `education_level` varchar(50) NOT NULL,
  `message` text,
  `preferred_time` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `college_id` (`college_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,1,'Raju','12345','undefined','Undergraduate','Heyy','Morning','new','2025-03-07 19:39:24'),(2,1,'Raju','12345','undefined','Undergraduate','heyy','Afternoon','processed','2025-03-07 19:41:58'),(3,1,'Banshal','54321','undefined','Undergraduate','heyyy','Afternoon','new','2025-03-07 19:45:34'),(4,2,'Banshal2','7980682955','2','Undergraduate','','Morning','new','2025-03-08 05:53:41'),(5,13,'Banshal3','8972565464','1','Undergraduate','','Afternoon','contacted','2025-03-08 14:48:18');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `college_admins`
--

DROP TABLE IF EXISTS `college_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `college_admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `college_id` int DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `college_id` (`college_id`),
  CONSTRAINT `college_admins_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `college_admins`
--

LOCK TABLES `college_admins` WRITE;
/*!40000 ALTER TABLE `college_admins` DISABLE KEYS */;
INSERT INTO `college_admins` VALUES (6,'Banshal','Banshal123',2,'Banshal@example.com','2025-03-05 12:27:58'),(9,'admin_madras','iitmadras',13,'iitmadras@example.com','2025-03-05 18:46:03'),(12,'superadmin','$2b$10$OEZ1JYeflKTse5zpdUUBuugtlGoskfixpX4T0kXzL2tZd0RJPYOzC',NULL,'superadmin@example.com','2025-03-06 09:14:34'),(13,'admin','$2b$10$elB07kTqODLsKFLZwAfL/eZW.s6iG.Fsp7jYsNl1KL6mS4qvkHzfe',NULL,'admin@example.com','2025-03-06 14:33:44'),(14,'admin_kanpur','$2b$10$qF4pF0VwQrM6khdOTOrb2.g8OWV3IDyfx/ASgHfXnxuEn2oCaGWli',16,'iitkanpur@example.com','2025-03-06 16:17:16'),(15,'rajesh123','rajesh',1,'rajesh@example.com','2025-03-07 11:48:00'),(16,'admin_roorkee','iitroorkee',18,'iitroorkee@example.com','2025-03-07 16:59:14'),(17,'admin_delhi','iitdelhi',14,'iitdelhi@example.com','2025-03-07 17:26:19'),(18,'admin_bombay','iitbombay',15,'iitbombay@example.com','2025-03-07 17:27:09'),(19,'admin_kharagpur','iitkharagpur',17,'iitkharagpur@example.com','2025-03-07 18:31:00');
/*!40000 ALTER TABLE `college_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `college_courses`
--

DROP TABLE IF EXISTS `college_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `college_courses` (
  `college_id` int NOT NULL,
  `course_id` int NOT NULL,
  `annual_fee` decimal(12,2) DEFAULT NULL,
  `seats` int DEFAULT NULL,
  PRIMARY KEY (`college_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `college_courses_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `college_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `college_courses`
--

LOCK TABLES `college_courses` WRITE;
/*!40000 ALTER TABLE `college_courses` DISABLE KEYS */;
INSERT INTO `college_courses` VALUES (2,2,120000.00,150),(2,3,300000.00,180),(2,4,250000.00,120),(13,1,200000.00,120);
/*!40000 ALTER TABLE `college_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `college_events`
--

DROP TABLE IF EXISTS `college_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `college_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `college_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `registration_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `college_id` (`college_id`),
  CONSTRAINT `college_events_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `college_events`
--

LOCK TABLES `college_events` WRITE;
/*!40000 ALTER TABLE `college_events` DISABLE KEYS */;
INSERT INTO `college_events` VALUES (2,2,'Ethnic Day Celebration',NULL,'2025-11-03 09:00:00','Reva Campus','Other',NULL,'2025-03-05 18:27:45'),(3,13,'TechEvent 2025',NULL,'2025-03-25 15:00:00','Auditorium','Other',NULL,'2025-03-05 18:59:29'),(4,2,'Code Event',NULL,'2025-03-25 15:25:00','Reva Campus','Open Day',NULL,'2025-03-07 11:42:28'),(5,1,'Ethnic Day Celebration',NULL,'2025-03-25 17:06:00','CMR University','Open Day',NULL,'2025-03-07 11:51:08'),(6,14,'Ethnic Day Celebration',NULL,'2025-03-05 16:00:00','IIT  Delhi campus','Other',NULL,'2025-03-07 17:46:11'),(7,17,'TechEvent 2025',NULL,'2025-06-04 17:00:00','IIT Kharagpur main campus','Open Day',NULL,'2025-03-07 18:39:02');
/*!40000 ALTER TABLE `college_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `college_reviews`
--

DROP TABLE IF EXISTS `college_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `college_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `college_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_college_unique` (`user_id`,`college_id`),
  KEY `college_id` (`college_id`),
  CONSTRAINT `college_reviews_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `college_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `college_reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `college_reviews`
--

LOCK TABLES `college_reviews` WRITE;
/*!40000 ALTER TABLE `college_reviews` DISABLE KEYS */;
INSERT INTO `college_reviews` VALUES (1,1,1,4,'Good college ','2025-03-07 19:59:56','2025-03-07 20:45:49'),(2,13,4,4,'wonderfull campus\n','2025-03-08 06:12:05','2025-03-08 06:12:05');
/*!40000 ALTER TABLE `college_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colleges`
--

DROP TABLE IF EXISTS `colleges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colleges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `ranking` int DEFAULT NULL,
  `established_year` int DEFAULT NULL,
  `total_students` int DEFAULT NULL,
  `placement_rate` decimal(5,2) DEFAULT NULL,
  `avg_package` decimal(10,2) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` text,
  `amenities` text,
  `accreditation` varchar(255) DEFAULT NULL,
  `map_link` text,
  `satellite_link` text,
  `photo_link1` text,
  `photo_link2` text,
  `photo_link3` text,
  `photo_link4` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colleges`
--

LOCK TABLES `colleges` WRITE;
/*!40000 ALTER TABLE `colleges` DISABLE KEYS */;
INSERT INTO `colleges` VALUES (1,'CMR University (Lakeside)','Baglur, Bengaluru, Karnataka',201,2013,2000,70.00,6.00,'https://www.cmr.edu.in/','This is for your kind information to drop out of cmr before its too late...','Library, Sports Room, Gym, cricket ground etc',NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.7097094313986!2d77.6554441!3d13.117567399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1bd82408da43%3A0xeebaa35808847cd5!2sCMR%20University%20(Lakeside%20Campus)!5e0!3m2!1sen!2sin!4v1741338895893!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','<iframe src=\"https://www.google.com/maps/embed?pb=!4v1741348167954!6m8!1m7!1sCAoSLEFGMVFpcE9mS29oTHNGcHNUcmZaVHd1VjYxbmFXQ1ZtaEtrNTJPay10Ymww!2m2!1d13.11799876801311!2d77.65536959752873!3f50.658752550638674!4f0!5f0.7820865974627469\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','https://images.shiksha.com/mediadata/images/1527054734phpgF7GdC.jpeg','https://www.cmr.edu.in/wp-content/uploads/2024/06/collabrations1.jpg','https://www.cmr.edu.in/wp-content/uploads/2015/05/campus-3.jpg','https://www.cmr.edu.in/blog/wp-content/uploads/2024/11/BLOG-Common-Banner-1405x565-1.webp'),(2,'Reva University','Bengaluru,Karnataka',145,2012,4000,85.00,5.00,'https://www.reva.edu.in/',NULL,'Library, Sports ground, Science labs, GYm etc','NAAC A+, NIRF','<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1942.8603297876482!2d77.63332433967285!3d13.116874500000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae191736187a37%3A0x3092096ba7fb4c9b!2sREVA%20UNIVERSITY!5e0!3m2!1sen!2sin!4v1741337406509!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','<iframe src=\"https://www.google.com/maps/embed?pb=!4v1741345015653!6m8!1m7!1sCAoSLEFGMVFpcE5yN1dwc1ZnZDNpTUJadDF2T1UzUFhxMEk5b2RoTjhRNlVRMHFY!2m2!1d13.11450618982574!2d77.6358673484721!3f358.12!4f2.6400000000000006!5f0.7820865974627469\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','https://lh5.googleusercontent.com/p/AF1QipOL5_cDQYYyN4uZOJ-dnNTV3R2xH4AVFXDjpTfr=w408-h306-k-no','https://revaeduin.s3.ap-south-1.amazonaws.com/uploads/album/1637408872_e5c24a1eb568681bee40.jpg','https://revaeduin.s3.ap-south-1.amazonaws.com/uploads/album/1640163208.jpg','https://theadmissiongroup.com/wp-content/uploads/2023/10/REVA_UNIVERSITY-1-1024x575.jpg'),(13,'IIT Madras','Chennai, India',1,1959,10000,90.00,22.00,'https://www.iitm.ac.in/','Dream college of every jee aspirants!!',NULL,NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.6927526972563!2d80.23111577450506!3d12.991492887325675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267f29aa9a61f%3A0x24ef264085e6a094!2sIndian%20Institute%20Of%20Technology%E2%80%93Madras%20(IIT%E2%80%93Madras)!5e0!3m2!1sen!2sin!4v1741332901387!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>',NULL,'https://media.glassdoor.com/l/c8/8a/7a/a1/himalaya-building.jpg?signature=246a08fe4c7ce01c8d2aadcdc689d2886284921b71afe2bd9855bbbcacecb9ef','https://imgs.search.brave.com/Q3Aka71xKfSqUTIoWdyd4j9c9taH4N7BaA7YluJ8Gtk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nbGFzc2Rvb3Iu/Y29tL2xzdDJ4L2I1/L2Q2LzY2LzY5L2lp/dC1tYWRyYXMuanBn','https://imgs.search.brave.com/tLDkEAaVIbAeGStnZlKC0qai6d8tWCCp6ImCHXRmPsg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nbGFzc2Rvb3Iu/Y29tL2xzdDJ4LzI5/L2MzL2IyLzc2L2lj/c3ItYnVpbGRpbmcu/anBn',NULL),(14,'IIT Delhi','Delhi, India',2,NULL,3500,85.00,22.00,NULL,NULL,NULL,NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.800420384915!2d77.19276789999999!3d28.545718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1df6b9055fb5%3A0x81c10b266b1ea3c0!2sIndian%20Institute%20Of%20Technology%20Delhi%20(IIT%20Delhi)!5e0!3m2!1sen!2sin!4v1741338243236!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','<iframe src=\"https://www.google.com/maps/embed?pb=!4v1741369471226!6m8!1m7!1sCAoSLEFGMVFpcE5FTnhpS2JaYWUyWC1ocFlyVkZOQU5tSWtrOFozdE53UTQ2TW53!2m2!1d28.54551551673433!2d77.192730812896!3f107.74819555479831!4f18.338904679631597!5f0.7820865974627469\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','https://home.iitd.ac.in/images/for-faculty/camp8.jpg','https://mse.iitd.ac.in/public/storage/misc/about_kYxHpCIgtA.jpg','https://qph.cf2.quoracdn.net/main-qimg-5ddb2f3d142cc2f2acc571adf503b61f-lq','https://media.glassdoor.com/lst2x/31/8d/96/00/iit-delhi.jpg?signature=509c976415b8eaaee376f46bd520468f074fd2f9dae243fbf9bc535dae43cc5b'),(15,'IIT Bombay','Mumbai, India',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14077.844636202275!2d72.91032351004704!3d19.1345296663488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c7f189efc039%3A0x68fdcea4c5c5894e!2sIndian%20Institute%20of%20Technology%20Bombay!5e0!3m2!1sen!2sin!4v1741338519473!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>',NULL,'https://www.vidyamandir.com/think-iit-think-vmc/assets/images/8.jpg','https://content.jdmagicbox.com/v2/comp/mumbai/p4/022pxx22.xx22.180529193131.d3p4/catalogue/lecture-hall-complex-1-and-2-powai-mumbai-cm48muhp7k.jpg','https://acr.iitbombay.org/wp-content/uploads/2022/11/Project-Evergreen-Inner-1065x640-1.webp','https://images.unsplash.com/photo-1577985043696-8bd54d9f093f?w=720&h=720&fit=crop'),(16,'IIT Kanpur','Kanpur, India',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3570.242473256206!2d80.2307594!3d26.5123251!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c3701c4a8be71%3A0x3afbe880abc38436!2sIndian%20Institute%20of%20Technology%20Kanpur!5e0!3m2!1sen!2sin!4v1741334004978!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>',NULL,'https://imgs.search.brave.com/pvI5V8IJq3bBWvm9Vns0woeTQN2c85olgFdwqpnrdjs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nbGFzc2Rvb3Iu/Y29tL2xzdDJ4LzM5/MDAzOC9paXQta2Fu/cHVyLW9mZmljZS5q/cGc','https://imgs.search.brave.com/FAz6BsAGoc2ZNLHj1ffq867Oecwa0Mt4mv4ghubfTCU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nbGFzc2Rvb3Iu/Y29tL2xzdDJ4Lzhm/LzEwLzcyLzYzL2Fy/aWFsLXZpZXctb2Yt/dGhlLWNhbXB1cy5q/cGc','https://imgs.search.brave.com/Hj0dF1DtVlsiBsoAkvC7SHlpz_tyWaClG42V7Wo3P9Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nbGFzc2Rvb3Iu/Y29tL2wvMTYvNDcv/NGIvYTkvbmV3LXNh/Yy1yb2FkLWlpdC1r/YW5wdXIuanBn',NULL),(17,'IIT Kharagpur','Kharagpur, India',5,1950,4500,85.00,20.00,NULL,NULL,NULL,NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29528.258993939064!2d87.28929494042072!3d22.314615349249998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1d440255555547%3A0x6f2f20dd0c0d6793!2sIndian%20Institute%20of%20Technology%2C%20Kharagpur!5e0!3m2!1sen!2sin!4v1741372450799!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','<iframe src=\"https://www.google.com/maps/embed?pb=!4v1741372659134!6m8!1m7!1sCAoSLEFGMVFpcE9qT1NMNXpzb2I4WDRPc0RwOXRFNjI4MnlWSlpZYlFfMFRRTHVN!2m2!1d22.32027818999845!2d87.31055449231785!3f107.60750921059162!4f-9.823790919444633!5f0.7820865974627469\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','https://images.unsplash.com/photo-1620496009285-ac853df7b9b6?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGlpdCUyMGtoYXJhZ3B1cnxlbnwwfHwwfHx8MA%3D%3D','https://avanti.in/wp-content/uploads/2017/06/IIT-Kharagpur.jpg','https://storytellersetc.wordpress.com/wp-content/uploads/2011/03/image030.jpg','https://images.shiksha.com/mediadata/images/articles/1694762241phpDuxpaX.jpeg'),(18,'IIT Roorkee','Roorkee, India',6,NULL,4000,NULL,18.00,NULL,NULL,NULL,NULL,'<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5036.4997790566085!2d77.88436634910124!3d29.865447927749113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390eb3650bfe37a7%3A0xa9d19b15af050467!2sIndian%20Institute%20Of%20Technology%20Roorkee!5e0!3m2!1sen!2sin!4v1741366919666!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','<iframe src=\"https://www.google.com/maps/embed?pb=!4v1741367510875!6m8!1m7!1sEjDXmNE5MUXdVO96nrDDBQ!2m2!1d29.86406502328614!2d77.89537521954679!3f313.0027!4f0!5f0.7820865974627469\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>','https://lh5.googleusercontent.com/p/AF1QipMKosg7M0P_v0Mus-W1mqGQ73zK08t1iBeyX1Kw=w408-h306-k-no','https://imgs.search.brave.com/ODSSoV4wv-QFcbi3Jk-DjQWLv79eiVwkQa9Y-FpHFXg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2Q5LzI1/LzYzL2Q5MjU2Mzk4/MDEzMjQ4NWRiMjA2/YTU1M2JkOWEwZjIz/LmpwZw','https://imgs.search.brave.com/fW924BrxPJRpN_rvIWvz1j5orIcFHrFMOaB8y8mzAEo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy81/LzVlL0FSRF9JSVRf/Um9vcmtlZS5KUEc','https://imgs.search.brave.com/94G0aV09EjHkOFNpKagO59CuAX5fOe9xLXb0g_nc0G0/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS1jZG4udHJpcGFk/dmlzb3IuY29tL21l/ZGlhL3Bob3RvLW8v/MGMvMzQvMDYvZDYv/bGF3bi1vZi1tYWlu/LWJ1aWxkaW5nLmpw/Zw'),(19,'test colege','Chennai, India',1,2025,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `colleges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `degree_type` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Electronic And Communication Engineering ','4','B.Tech',''),(2,'Electronic And Communication Engineering ','4','B.Tech',''),(3,'Computer Science and Engineering','4','B.Tech',''),(4,'Mechanical Engineering','4','B.Tech','');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `college_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `distance` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `college_id` (`college_id`),
  CONSTRAINT `facilities_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (5,2,'Main Library','library','Central Campus','2 min walk from main gate','Modern library with over 50,000 books'),(8,2,'Reva Gymnasium','sports','Reva University','10 min from main gate',''),(9,2,'Canteen','food','Reva University','15 min from main gate',''),(10,1,'CMR Library','library','Lakeside campus SOET Block','15 min from main gate',''),(11,1,'CMR Gymnasium','sports','CMR gym','',''),(12,14,'Library','library','IIT Delhi Campus','10 min from main gate',''),(13,14,'Discussion Room','other','IIT Delhi Campus','10min',''),(14,14,'Medical','medical','IIT Delhi Campus','15 min from main gate',''),(15,17,'Library','library','Main building','30 min from main gate',''),(16,17,'Sports hall','sports','Sport Room block B','30 min from back gate','');
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'banshal123','$2b$10$SIEvIATOUDC9akrh0nAgFep0/yiVNSV5AO0s2DQcVKg/.wBER/0I6','example123@gmail.com','2025-03-05 11:17:04'),(2,'testuser','$2b$10$5XosZhOCLAIh3291I4nkuOiSqMsCHBexL7lZa5CzZ6bx7yaBM5c4q','testuser@example.com','2025-03-06 14:52:44'),(3,'example','$2b$10$cv.5dYVvfrU6qT5bSCk6Bu7ByNeb25kAYomY0DHerrwQxBkb/uxqC','example@example.com','2025-03-06 16:53:00'),(4,'testuser2','$2b$10$VBJuFsWnZk1lf9P0..rM6elzH9lKakmJ3Lmk2ZU/tuEd.zi5ifgEK','testuser2@example.com','2025-03-08 05:47:56');
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

-- Dump completed on 2025-03-09  8:49:46
