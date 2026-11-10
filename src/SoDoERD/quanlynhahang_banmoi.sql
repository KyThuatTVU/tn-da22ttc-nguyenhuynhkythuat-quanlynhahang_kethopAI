-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: amthuc_phuongnam
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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `ma_admin` int NOT NULL AUTO_INCREMENT,
  `tai_khoan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mat_khau_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_hien_thi` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anh_dai_dien` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quyen` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'superadmin',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_admin`),
  UNIQUE KEY `tai_khoan` (`tai_khoan`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin_nam','hash123','Quản lý Nam','nam@amthuc.vn',NULL,'superadmin','2026-03-23 08:58:24'),(2,'nv_thanh','hash456','Nhân viên Thanh','thanh@amthuc.vn',NULL,'staff','2026-03-23 08:58:24'),(3,'nguyenhuynhkithuat84tv','google_oauth','Thuật Thuật','nguyenhuynhkithuat84tv@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocIo90HHFVO_TpBzGlbr-kcFij7f4VyqjWwWZYUSGqJIjRzSHp85=s200-c','superadmin','2026-03-24 13:55:46');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `album_anh`
--

DROP TABLE IF EXISTS `album_anh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album_anh` (
  `ma_album` int NOT NULL AUTO_INCREMENT,
  `duong_dan_anh` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loai_anh` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_album`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album_anh`
--

LOCK TABLES `album_anh` WRITE;
/*!40000 ALTER TABLE `album_anh` DISABLE KEYS */;
INSERT INTO `album_anh` VALUES (1,'https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/649223667_1385406743613791_104136711006836042_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=b_AvQy7XJWYQ7kNvwF8h6uf&_nc_oc=AdqFU1Rn_yeqPL0o5bFk89QlwMv7KX7AcOn3Vj4byE8_j0x9xUCkhu9piwkFhQnOSXA&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=5qN5d313o7k6qoDXTKtUzg&_nc_ss=7b2a8&oh=00_Af9jx8auH4k-yatA9WqkVQPYkeOL_T6oAWW5Ezptj1UIIA&oe=6A2424C4','khong_gian','Đồng xanh thước tha cánh cò dập dìu','2026-05-31 11:58:50'),(2,'https://scontent.fsgn5-21.fna.fbcdn.net/v/t39.30808-6/648837678_1385406630280469_4999692259173437148_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Wwnxz89tzOQQ7kNvwHrZL8W&_nc_oc=Adp4e3_pReNRYvgfwuGXN-AQWp6DYpB7uz7U06ymnL6QLea5pwfwJgk6oXkK74B9RHY&_nc_zt=23&_nc_ht=scontent.fsgn5-21.fna&_nc_gid=sDlnEtrSMj5178lsqEtCTg&_nc_ss=7b2a8&oh=00_Af8OdXuqXRzysDgGosQvPiSbMzkUHWdp6U_pkJHwZrPGaA&oe=6A240A85','khong_gian','Một chút không khí tuổi thơ ùa về','2026-05-31 12:00:43'),(3,'album-1780203651964-185621310.jpg','khong_gian','Cô em xinh đẹp','2026-05-31 12:00:51'),(4,'https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-6/649338181_1385406596947139_5657546005360265601_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=aIvoH4y_DKEQ7kNvwFIVvI-&_nc_oc=Adqhvn7VDknq0CgeQXPx-uETrl53meXShY7vNqrc2kJP3PW0d6ZRT76k-ImF8UI0jKI&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=FQDaQejnBXkcIuFSAF3sdw&_nc_ss=7b2a8&oh=00_Af8jOCelL6q2irml9PuV9u_5MxJwWcr68N5HAFJVNFVG-g&oe=6A242A68','khong_gian','Ngôi nhà bồng bềnh giữa hồ sen xanh mát','2026-05-31 12:00:59'),(5,'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/648643330_1385406240280508_8144809939790309724_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Gomeu5-w7sYQ7kNvwFeFKAB&_nc_oc=AdqnCm4Luw9O_o_I9yLvjpTqTsxN7dBSMXz0o0u4FS3dNAgLnS5Dv7sb3HoOgi6eVi0&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=jbGvUT1loJeP0QYXjQI0Wg&_nc_ss=7b2a8&oh=00_Af_S82zfcv2J6Ah9U-CIuFIxC3SxlFBHfnz4Sv-ThnF2FQ&oe=6A2410A2','mon_an','Bánh bò ngũ sắc âm vị miền Tây, mỗi khi mẹ đi chợ về','2026-05-31 12:01:08'),(6,'album-1780203679730-496959296.jpg','khong_gian','Nàng thơ dưới những tán sen xanh mướt\r\n','2026-05-31 12:01:19'),(7,'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/648393507_1385405326947266_4403793635330406629_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=LonJtET0UPwQ7kNvwEzeRmc&_nc_oc=AdoSBCSzi8oCKwTXU9-AZqlPOVn48kHSIZJWHYOJdpxWfHnxadQbJjcyNjN4LSzgOA8&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=-qeGn6ZEQ2oHN9ZT9rqGgw&_nc_ss=7b2a8&oh=00_Af8In1W5oZ52NGPXpaHfb8s4y2cBmpYRvy9BKEDSjlcFrg&oe=6A2426FA','mon_an','Tôm sông tươi sống sông Hậu đánh bắt','2026-05-31 12:01:27'),(8,'https://scontent.fsgn5-13.fna.fbcdn.net/v/t39.30808-6/649390416_1385405330280599_4581531336656014313_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=Zztjugl5ukMQ7kNvwH0Lvcl&_nc_oc=AdpGwdIpGd8zMJyUvW3hF3WPrQBJF2qslBd6KyDkfd4DbeJTrcAKMo45knEbTYUHUvk&_nc_zt=23&_nc_ht=scontent.fsgn5-13.fna&_nc_gid=7rgsHGYv6q7o0L6TuNHrzw&_nc_ss=7b2a8&oh=00_Af8ROO7b5f1jsPNc40kPly86pcLdwlSaBTjWguQbwzAsMg&oe=6A240876','mon_an','Món cá heo kho mẵn đậm chất quê hương','2026-05-31 12:01:35'),(9,'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/648532681_1385405336947265_1388018106349892214_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=7VRCxqckVkcQ7kNvwER084b&_nc_oc=Adqqsocnlv2I0qqwHnpWwTN7qQHODIDBiSX3wFJipH4_iHATEGm1JA13qHKQGL_po48&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=nyskkbdRF1dIKyxCQ_kCmw&_nc_ss=7b2a8&oh=00_Af9_wsv-SumPk3C71nuIYbhZH-WPndKqczhzx92JRPrHJw&oe=6A2408D0','mon_an','Món ăn dân dã đậm chất miền Tây\r\n','2026-05-31 12:01:42'),(10,'https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/649189730_1385405380280594_939764505356671677_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=127cfc&_nc_ohc=s4OHC0vE69AQ7kNvwEMvso3&_nc_oc=Adrtv7sCJ_fE_xLUWmWPhLDFg7o3vDx6cWkp73qyQwnGMCijoBVUyLwdbq3XcPJcw-U&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=Hkk2O7SlaljBXx_RqKXc-Q&_nc_ss=7b2a8&oh=00_Af9G51OUcBJC5iCxdeYhgz3QGhB0-kLbFDkBQbYbcJrJ6g&oe=6A23FE18','khong_gian','Không gian thoáng mát bình yên\r\n','2026-05-31 12:01:49'),(11,'album-1780367397108-175700561.jpg','khong_gian','Không gian mát mẻ, thích hợp lai rai','2026-06-02 09:29:57'),(12,'album-1780367635442-934807742.jpg','mon_an','Gà hấp mắm nhỉ đậm đà vị sốt gia truyền','2026-06-02 09:33:55'),(13,'album-1780367683121-788723712.jpg','mon_an','Cá tai tượng chiên xù thơm ngon ','2026-06-02 09:34:43'),(14,'album-1780369881849-3843087.jpg','mon_an','Bánh khọt miền Tây cô bác ơi','2026-06-02 10:11:21'),(15,'album-1780369944094-11610245.jpg','khong_gian','Không gian đêm sinh động','2026-06-02 10:12:24'),(16,'album-1780371272416-910989365.jpg','su_kien','Tiệc sinh nhật của khách yêu','2026-06-02 10:34:32'),(17,'album-1780371375592-46786050.jpg','su_kien','Nơi lý tưởng hẹn hò','2026-06-02 10:36:15'),(18,'album-1780371468278-844294575.jpg','khach_hang','Đón khách ạ','2026-06-02 10:37:48'),(19,'album-1780371847029-656407414.jpg','khach_hang','Khách thương ủng hộ nhiều lần','2026-06-02 10:44:07'),(20,'album-1780371910360-229948794.jpg','su_kien','8/3 vui vẻ','2026-06-02 10:45:10'),(21,'album-1780371959080-338579150.jpg','su_kien','Tiệc nướng nhân ngày 8/3','2026-06-02 10:45:59'),(22,'album-1780372000516-270964880.jpg','mon_an','Lẩu cua biển hấp dẫn','2026-06-02 10:46:40'),(23,'album-1780372053100-783558590.jpg','khach_hang','Nhộn nhịp quá ạ','2026-06-02 10:47:33'),(24,'album-1780372121506-645187635.jpg','khach_hang','Nâng ly lên ạ','2026-06-02 10:48:41'),(25,'album-1780372181407-860924327.jpg','khach_hang','Họp mặt anh chị em','2026-06-02 10:49:41'),(26,'album-1780372450574-940355604.jpg','su_kien','Họp mặt gia đình nhà Linh ạ','2026-06-02 10:54:10'),(27,'album-1780372983617-406714591.jpg','su_kien','nhà Linh hôm nay đông vui quá ạ','2026-06-02 11:03:03'),(28,'album-1780373026325-34866162.jpg','su_kien','Cùng chụp hình với Linh nhe','2026-06-02 11:03:46'),(29,'album-1780373097770-224570912.jpg','su_kien','Sau cơn mưa hồ sen nhà Linh ngập quá trời','2026-06-02 11:04:57');
/*!40000 ALTER TABLE `album_anh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anh_san_pham`
--

DROP TABLE IF EXISTS `anh_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anh_san_pham` (
  `ma_anh` int NOT NULL AUTO_INCREMENT,
  `ma_mon` int NOT NULL,
  `duong_dan_anh` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_anh`),
  KEY `fk_anh_mon` (`ma_mon`),
  CONSTRAINT `fk_anh_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anh_san_pham`
--

LOCK TABLES `anh_san_pham` WRITE;
/*!40000 ALTER TABLE `anh_san_pham` DISABLE KEYS */;
/*!40000 ALTER TABLE `anh_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ban`
--

DROP TABLE IF EXISTS `ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ban` (
  `ma_ban` int NOT NULL AUTO_INCREMENT,
  `ten_ban` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_cho` int DEFAULT '4',
  `vi_tri` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tầng 1, Sân vườn...',
  `trang_thai` enum('trong','dang_phuc_vu','da_dat') COLLATE utf8mb4_unicode_ci DEFAULT 'trong',
  PRIMARY KEY (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ban`
--

LOCK TABLES `ban` WRITE;
/*!40000 ALTER TABLE `ban` DISABLE KEYS */;
INSERT INTO `ban` VALUES (1,'Bàn 01',4,'Sảnh 1','dang_phuc_vu'),(2,'Bàn 02',4,'Sảnh 1','trong'),(3,'Bàn VIP',10,'Phòng máy lạnh','trong'),(4,'Bàn 3',4,'Sảnh 1','trong'),(5,'Bàn 4',4,'Sảnh 1','trong'),(6,'Bàn 5',4,'Sảnh 1','dang_phuc_vu'),(8,'Bàn 6',4,'Sảnh 1','trong');
/*!40000 ALTER TABLE `ban` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bang_luong`
--

DROP TABLE IF EXISTS `bang_luong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bang_luong` (
  `ma_luong` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `thang` int NOT NULL,
  `nam` int NOT NULL,
  `tong_gio_lam` decimal(10,2) DEFAULT '0.00',
  `luong_theo_gio` decimal(15,2) DEFAULT '0.00',
  `luong_co_ban` decimal(14,2) DEFAULT '0.00',
  `luong_lam_them` decimal(14,2) DEFAULT '0.00',
  `thuong` decimal(14,2) DEFAULT '0.00',
  `phat` decimal(14,2) DEFAULT '0.00',
  `tong_luong` decimal(14,2) NOT NULL,
  `trang_thai` enum('chua_thanh_toan','da_thanh_toan') COLLATE utf8mb4_unicode_ci DEFAULT 'chua_thanh_toan',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_luong`),
  UNIQUE KEY `unique_luong_thang_nam` (`ma_nhan_vien`,`thang`,`nam`),
  CONSTRAINT `fk_luong_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bang_luong`
--

LOCK TABLES `bang_luong` WRITE;
/*!40000 ALTER TABLE `bang_luong` DISABLE KEYS */;
INSERT INTO `bang_luong` VALUES (1,3,3,2026,5.00,0.00,96774.19,0.00,0.00,0.00,96774.19,'chua_thanh_toan','2026-03-30 10:00:48'),(2,4,3,2026,3.00,25000.00,0.00,0.00,0.00,0.00,75000.00,'chua_thanh_toan','2026-03-30 10:00:48'),(3,3,4,2026,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'chua_thanh_toan','2026-04-20 10:40:27'),(5,4,4,2026,11.00,25000.00,0.00,0.00,0.00,0.00,275000.00,'da_thanh_toan','2026-04-20 11:07:55'),(8,3,5,2026,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'chua_thanh_toan','2026-05-23 10:39:07'),(9,4,5,2026,0.75,25000.00,0.00,0.00,0.00,0.00,18750.00,'chua_thanh_toan','2026-05-23 10:39:07'),(10,5,5,2026,0.00,25000.00,0.00,0.00,0.00,0.00,0.00,'chua_thanh_toan','2026-05-23 10:39:07');
/*!40000 ALTER TABLE `bang_luong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `binh_luan_tin_tuc`
--

DROP TABLE IF EXISTS `binh_luan_tin_tuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `binh_luan_tin_tuc` (
  `ma_binh_luan` int NOT NULL AUTO_INCREMENT,
  `ma_tin_tuc` int NOT NULL,
  `ma_nguoi_dung` int DEFAULT NULL,
  `ten_nguoi_binh_luan` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_nguoi_binh_luan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `trang_thai` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `ma_binh_luan_cha` int DEFAULT NULL,
  `ngay_binh_luan` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_binh_luan`),
  KEY `fk_binhluan_tin` (`ma_tin_tuc`),
  KEY `fk_binhluan_cha` (`ma_binh_luan_cha`),
  CONSTRAINT `fk_binhluan_cha` FOREIGN KEY (`ma_binh_luan_cha`) REFERENCES `binh_luan_tin_tuc` (`ma_binh_luan`) ON DELETE CASCADE,
  CONSTRAINT `fk_binhluan_tin` FOREIGN KEY (`ma_tin_tuc`) REFERENCES `tin_tuc` (`ma_tin_tuc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `binh_luan_tin_tuc`
--

LOCK TABLES `binh_luan_tin_tuc` WRITE;
/*!40000 ALTER TABLE `binh_luan_tin_tuc` DISABLE KEYS */;
/*!40000 ALTER TABLE `binh_luan_tin_tuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ca_lam_viec`
--

DROP TABLE IF EXISTS `ca_lam_viec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ca_lam_viec` (
  `ma_ca` int NOT NULL AUTO_INCREMENT,
  `ten_ca` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gio_bat_dau` time NOT NULL,
  `gio_ket_thuc` time NOT NULL,
  `he_so_luong` decimal(3,2) DEFAULT '1.00' COMMENT 'Hệ số lương ca đêm/lễ',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_ca`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_lam_viec`
--

LOCK TABLES `ca_lam_viec` WRITE;
/*!40000 ALTER TABLE `ca_lam_viec` DISABLE KEYS */;
INSERT INTO `ca_lam_viec` VALUES (4,'Ca gãy 1','09:00:00','18:00:00',1.00,'2026-03-29 11:33:38'),(5,'Ca tối','17:00:00','22:00:00',1.00,'2026-03-29 11:33:38'),(6,'Ca sáng','09:00:00','22:00:00',1.00,'2026-03-30 08:54:02'),(7,'Ca gãy 1','13:00:00','22:00:00',1.00,'2026-05-23 10:35:45'),(8,'Ca chiều','11:00:00','22:00:00',1.00,'2026-05-23 10:51:06');
/*!40000 ALTER TABLE `ca_lam_viec` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cai_dat`
--

DROP TABLE IF EXISTS `cai_dat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cai_dat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=3373 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cai_dat`
--

LOCK TABLES `cai_dat` WRITE;
/*!40000 ALTER TABLE `cai_dat` DISABLE KEYS */;
INSERT INTO `cai_dat` VALUES (1,'site_name','Ẩm Thực Phương Nam','Tên website','2026-03-23 08:58:24'),(2,'hotline','1900 1234','Số điện thoại hỗ trợ','2026-03-23 08:58:24'),(3,'hieu_ung_tuyet','0','Bật/tắt hiệu ứng tuyết rơi (1=bật, 0=tắt)','2026-06-02 10:40:39'),(4,'hieu_ung_hoa_mai','1','Bật/tắt hiệu ứng hoa mai (1=bật, 0=tắt)','2026-06-02 10:40:45'),(5,'hieu_ung_intro_tet','0','Bật/tắt intro chào mừng Tết (1=bật, 0=tắt)','2026-04-18 08:52:53'),(6,'hieu_ung_intro_giang_sinh','0','Bật/tắt intro Giáng sinh (1=bật, 0=tắt)','2026-04-27 10:50:11'),(31,'ten_nha_hang','Nhà Hàng Phương Nam',NULL,'2026-05-23 09:04:07'),(32,'so_dien_thoai','0388853044',NULL,'2026-05-23 09:04:07'),(33,'email','nguyenhuynhkithuat84tv@gmail.com',NULL,'2026-05-23 09:04:07'),(34,'website','',NULL,'2026-05-23 09:04:07'),(35,'dia_chi','Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh',NULL,'2026-05-23 09:04:07'),(537,'facebook_url','',NULL,'2026-04-27 10:50:17'),(538,'youtube_url','',NULL,'2026-04-27 10:50:17'),(1063,'latitude','9.9234','Vĩ độ GPS của nhà hàng (Đại học Trà Vinh)','2026-05-23 09:04:07'),(1064,'longitude','106.3465','Kinh độ GPS của nhà hàng (Đại học Trà Vinh)','2026-05-23 09:04:07'),(1065,'radius','500','Bán kính cho phép chấm công (mét)','2026-05-23 09:04:07'),(1201,'hieu_ung_hoa_osaka_admin','0','Bật/tắt hiệu ứng hoa Osaka vàng rơi ở trang Admin (1=bật, 0=tắt)','2026-06-02 10:40:15');
/*!40000 ALTER TABLE `cai_dat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cam_xuc_binh_luan`
--

DROP TABLE IF EXISTS `cam_xuc_binh_luan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cam_xuc_binh_luan` (
  `ma_cam_xuc` int NOT NULL AUTO_INCREMENT,
  `ma_binh_luan` int NOT NULL,
  `ma_nguoi_dung` int NOT NULL,
  `loai_cam_xuc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'like',
  PRIMARY KEY (`ma_cam_xuc`),
  KEY `fk_cx_binhluan` (`ma_binh_luan`),
  CONSTRAINT `fk_cx_binhluan` FOREIGN KEY (`ma_binh_luan`) REFERENCES `binh_luan_tin_tuc` (`ma_binh_luan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cam_xuc_binh_luan`
--

LOCK TABLES `cam_xuc_binh_luan` WRITE;
/*!40000 ALTER TABLE `cam_xuc_binh_luan` DISABLE KEYS */;
/*!40000 ALTER TABLE `cam_xuc_binh_luan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cam_xuc_tin_tuc`
--

DROP TABLE IF EXISTS `cam_xuc_tin_tuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cam_xuc_tin_tuc` (
  `ma_cam_xuc` int NOT NULL AUTO_INCREMENT,
  `ma_tin_tuc` int NOT NULL,
  `ma_nguoi_dung` int NOT NULL,
  `loai_cam_xuc` enum('like','love','haha','wow','sad','angry') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_cam_xuc`),
  UNIQUE KEY `ma_tin_tuc` (`ma_tin_tuc`,`ma_nguoi_dung`),
  CONSTRAINT `fk_cx_tin` FOREIGN KEY (`ma_tin_tuc`) REFERENCES `tin_tuc` (`ma_tin_tuc`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cam_xuc_tin_tuc`
--

LOCK TABLES `cam_xuc_tin_tuc` WRITE;
/*!40000 ALTER TABLE `cam_xuc_tin_tuc` DISABLE KEYS */;
INSERT INTO `cam_xuc_tin_tuc` VALUES (1,1,4,'love','2026-03-24 16:08:26');
/*!40000 ALTER TABLE `cam_xuc_tin_tuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cham_cong`
--

DROP TABLE IF EXISTS `cham_cong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cham_cong` (
  `ma_cham_cong` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `ngay` date NOT NULL,
  `gio_vao` time DEFAULT NULL,
  `gio_ra` time DEFAULT NULL,
  `so_gio_lam` float DEFAULT '0',
  `luong_ngay` decimal(10,2) DEFAULT '0.00',
  `trang_thai` enum('dung_gio','di_muon','ve_som','nghi_phep','nghi_khong_phep','ngoai_ca') COLLATE utf8mb4_unicode_ci DEFAULT 'dung_gio',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `anh_cham_cong` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh check-in',
  `anh_checkout` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh check-out',
  `latitude` decimal(10,8) DEFAULT NULL COMMENT 'Vĩ độ check-in',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT 'Kinh độ check-in',
  `latitude_out` decimal(10,8) DEFAULT NULL COMMENT 'Vĩ độ check-out',
  `longitude_out` decimal(11,8) DEFAULT NULL COMMENT 'Kinh độ check-out',
  `loai` enum('checkin','checkout','manual') COLLATE utf8mb4_unicode_ci DEFAULT 'manual' COMMENT 'Loại chấm công',
  PRIMARY KEY (`ma_cham_cong`),
  KEY `idx_nhan_vien_ngay` (`ma_nhan_vien`,`ngay`),
  KEY `idx_ngay` (`ngay`),
  CONSTRAINT `fk_chamcong_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cham_cong`
--

LOCK TABLES `cham_cong` WRITE;
/*!40000 ALTER TABLE `cham_cong` DISABLE KEYS */;
INSERT INTO `cham_cong` VALUES (1,4,'2026-03-30','08:00:00','11:00:00',3,0.00,'ve_som','','2026-03-30 10:43:49',NULL,NULL,NULL,NULL,NULL,NULL,'manual'),(2,3,'2026-03-30','17:00:00','22:00:00',5,0.00,'dung_gio','','2026-03-31 08:43:40',NULL,NULL,NULL,NULL,NULL,NULL,'manual'),(3,4,'2026-04-18','17:00:00','22:00:00',5,0.00,'dung_gio','','2026-04-18 12:03:33',NULL,NULL,NULL,NULL,NULL,NULL,'manual'),(4,4,'2026-04-20','17:00:00','23:00:00',6,0.00,'dung_gio','','2026-04-20 11:07:09',NULL,NULL,NULL,NULL,NULL,NULL,'manual'),(8,4,'2026-05-23','09:53:36','10:38:40',0.75,18750.00,'ve_som','Chấm công khuôn mặt (QR Code) | GPS: 9.92002783674841, 106.34692643665149 (±82m) | Đi muộn 53 phút | Về sớm 442 phút | GPS Out: 9.92003683818995, 106.3469336214694 (±84m)','2026-05-23 09:53:36','uploads\\attendance\\attendance-1779504816073-354825015.jpg','uploads\\attendance\\attendance-1779507520146-130905447.jpg',9.92002784,106.34692644,9.92003684,106.34693362,'manual'),(10,5,'2026-05-23','10:43:22',NULL,0,0.00,'di_muon','Chấm công khuôn mặt (QR Code) | GPS: 9.92005579601572, 106.34688061568659 (±98m) | Đi muộn 3 phút','2026-05-23 10:43:22','uploads\\attendance\\attendance-1779507801897-167384174.jpg',NULL,9.92005580,106.34688062,NULL,NULL,'manual'),(11,6,'2026-05-23','10:51:26',NULL,0,0.00,'di_muon','Chấm công khuôn mặt (QR Code) | GPS: 9.92003683818995, 106.3469336214694 (±84m) | Đi muộn 111 phút','2026-05-23 10:51:26','uploads\\attendance\\attendance-1779508286479-285444211.jpg',NULL,9.92003684,106.34693362,NULL,NULL,'manual'),(12,4,'2026-05-31','12:30:01',NULL,0,0.00,'dung_gio','Chấm công khuôn mặt (QR Code) | GPS: 9.920622263171696, 106.34711021986782 (±86m)','2026-05-31 12:30:01','uploads\\attendance\\attendance-1780205401157-529480271.jpg',NULL,9.92062226,106.34711022,NULL,NULL,'manual'),(13,6,'2026-06-12','09:00:07',NULL,0,0.00,'di_muon','Chấm công khuôn mặt (QR Code) | GPS: 9.920447037202049, 106.34725577634218 (±108m) | Đi muộn 0 phút','2026-06-12 09:00:07','uploads\\attendance\\attendance-1781229607527-838681256.jpg',NULL,9.92044704,106.34725578,NULL,NULL,'manual');
/*!40000 ALTER TABLE `cham_cong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_preference_insights`
--

DROP TABLE IF EXISTS `chatbot_preference_insights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbot_preference_insights` (
  `ma_insight` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `ma_mon` int DEFAULT NULL,
  `ten_mon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tag_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sentiment` enum('positive','negative','neutral') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'positive',
  `score_delta` decimal(10,2) NOT NULL DEFAULT '0.00',
  `confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
  `evidence` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_insight`),
  KEY `idx_user` (`ma_nguoi_dung`),
  KEY `idx_user_tag` (`ma_nguoi_dung`,`tag_key`)
) ENGINE=InnoDB AUTO_INCREMENT=270 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_preference_insights`
--

LOCK TABLES `chatbot_preference_insights` WRITE;
/*!40000 ALTER TABLE `chatbot_preference_insights` DISABLE KEYS */;
INSERT INTO `chatbot_preference_insights` VALUES (208,5,2,'Lẩu Cù Lao','thanh_mat','positive',1.50,0.80,'lẩu cù lao của nhà hàng mình á','2026-07-04 11:10:15'),(209,5,NULL,NULL,'lau','positive',1.50,0.85,'lau','2026-07-04 11:10:15'),(210,5,2,'Lẩu Cù Lao','thanh_mat','positive',1.50,0.80,'lẩu cù lao á','2026-07-04 11:10:15'),(211,5,NULL,NULL,'lau','positive',1.50,0.85,'lau','2026-07-04 11:10:15'),(212,3,NULL,NULL,'tuoi','positive',1.50,0.85,'moi','2026-07-04 11:10:15'),(213,3,NULL,NULL,'hai_san','negative',-1.50,0.85,'ca','2026-07-04 11:10:15'),(214,3,NULL,NULL,'an_chay','negative',-1.50,0.85,'chay','2026-07-04 11:10:15'),(215,3,NULL,NULL,'hai_san','positive',1.50,0.85,'ca','2026-07-04 11:10:15'),(216,3,NULL,NULL,'nuong','positive',1.50,0.85,'nuong','2026-07-04 11:10:15'),(217,3,NULL,NULL,'an_chay','positive',1.50,0.85,'chay','2026-07-04 11:10:15'),(218,3,NULL,NULL,'hai_san','positive',1.50,0.85,'ca','2026-07-04 11:10:15'),(219,3,NULL,NULL,'nuong','positive',1.50,0.85,'nuong','2026-07-04 11:10:15'),(220,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(221,3,NULL,NULL,'phuc_vu','positive',1.50,0.85,'tu van','2026-07-04 11:10:15'),(222,3,NULL,NULL,'thanh_mat','positive',1.50,0.85,'thanh, thanh mat','2026-07-04 11:10:15'),(223,3,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'dạo gần đây hot món gỏi gà măng cục ở đây cón không nhỉ','2026-07-04 11:10:15'),(224,3,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'dạo gần đây hot món gỏi gà măng cục ở đây cón không nhỉ','2026-07-04 11:10:15'),(225,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(226,3,NULL,NULL,'thanh_mat','negative',-1.50,0.85,'thanh','2026-07-04 11:10:15'),(227,3,NULL,NULL,'tuoi','positive',1.50,0.85,'moi','2026-07-04 11:10:15'),(228,3,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(229,3,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(230,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(231,3,24,'Gỏi bò bóp thấu','chua','positive',1.50,0.80,'hiển thị gỏi bò bóp thấu','2026-07-04 11:10:15'),(232,3,24,'Gỏi bò bóp thấu','thit_bo','positive',1.50,0.80,'hiển thị gỏi bò bóp thấu','2026-07-04 11:10:15'),(233,3,NULL,NULL,'thit_bo','positive',1.50,0.85,'bo','2026-07-04 11:10:15'),(234,3,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(235,3,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(236,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(237,5,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(238,5,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(239,5,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(240,5,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(241,5,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(242,5,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(243,5,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(244,5,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'ở đây có món gỏi gà măng cục không','2026-07-04 11:10:15'),(245,5,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(246,3,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'có món gỏi gà măng cục không','2026-07-04 11:10:15'),(247,3,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'có món gỏi gà măng cục không','2026-07-04 11:10:15'),(248,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(249,3,37,'Gỏi gà măng cục','thanh_mat','positive',1.50,0.80,'có món gỏi gà măng cục không','2026-07-04 11:10:15'),(250,3,37,'Gỏi gà măng cục','thit_ga','positive',1.50,0.80,'có món gỏi gà măng cục không','2026-07-04 11:10:15'),(251,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-04 11:10:15'),(252,3,NULL,NULL,'chua','positive',1.50,0.85,'chua','2026-07-04 11:10:15'),(253,4,NULL,NULL,'hai_san','positive',1.50,0.85,'tom','2026-07-04 11:10:15'),(254,3,NULL,NULL,'tuoi','positive',1.50,0.85,'moi','2026-07-04 11:10:15'),(255,4,NULL,NULL,'do_uong','positive',1.50,0.85,'tra','2026-07-04 11:10:15'),(256,3,NULL,NULL,'do_uong','positive',1.50,0.85,'tra','2026-07-04 11:10:15'),(257,3,44,'Lẩu cá ','cay','negative',-1.50,0.80,'tôi không thích món lẩu cá','2026-07-04 11:10:15'),(258,3,44,'Lẩu cá ','hai_san','negative',-1.50,0.80,'tôi không thích món lẩu cá','2026-07-04 11:10:15'),(259,3,NULL,NULL,'hai_san','negative',-1.50,0.85,'ca','2026-07-04 11:10:15'),(260,3,NULL,NULL,'lau','negative',-1.50,0.85,'lau','2026-07-04 11:10:15'),(261,3,NULL,NULL,'thit_ga','positive',1.50,0.85,'ga','2026-07-06 16:22:17'),(262,3,NULL,NULL,'thanh_mat','positive',1.50,0.85,'thanh','2026-07-06 16:22:45'),(263,3,NULL,NULL,'thanh_mat','positive',1.50,0.85,'thanh','2026-07-06 16:22:57'),(264,3,44,'Lẩu cá ','cay','positive',1.50,0.80,'ơ day có lẩu cá không','2026-07-06 16:23:23'),(265,3,44,'Lẩu cá ','hai_san','positive',1.50,0.80,'ơ day có lẩu cá không','2026-07-06 16:23:23'),(266,3,NULL,NULL,'hai_san','positive',1.50,0.85,'ca','2026-07-06 16:23:23'),(267,3,NULL,NULL,'lau','positive',1.50,0.85,'lau','2026-07-06 16:23:23'),(268,3,NULL,NULL,'lau','positive',1.50,0.85,'lau','2026-07-06 16:23:47'),(269,3,NULL,NULL,'lau','positive',1.50,0.85,'lau','2026-07-07 07:00:28');
/*!40000 ALTER TABLE `chatbot_preference_insights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_session`
--

DROP TABLE IF EXISTS `chatbot_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbot_session` (
  `session_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nguoi_dung` int DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `fk_session_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_session`
--

LOCK TABLES `chatbot_session` WRITE;
/*!40000 ALTER TABLE `chatbot_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `chatbot_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_tri_thuc`
--

DROP TABLE IF EXISTS `chatbot_tri_thuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbot_tri_thuc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `noi_dung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_tri_thuc`
--

LOCK TABLES `chatbot_tri_thuc` WRITE;
/*!40000 ALTER TABLE `chatbot_tri_thuc` DISABLE KEYS */;
INSERT INTO `chatbot_tri_thuc` VALUES (1,'Thông tin chung về nhà hàng','Nhà hàng Ẩm thực Phương Nam với slogan \"Phương Nam món ngon như nhà nấu\" tọa lạc tại 120 Nguyễn Minh Tâm, Khóm 4, Phường 6, Thành phố Trà Vinh. Nhà hàng chuyên phục vụ các món ăn đặc sản đậm chất miền Tây Nam Bộ. Hotline liên hệ: 0123 456 789. Email: info@phuongnam.vn. Website: phuongnam.vn. Giờ mở cửa từ thứ 2 đến thứ 6 là 08:00 - 22:00, và thứ 7 đến chủ nhật là 07:00 - 23:00.','2026-05-22 10:35:48','2026-05-22 10:35:48'),(2,'Người sáng lập và chủ nhà hàng','Chủ nhà hàng Ẩm thực Phương Nam là chị Hoàng Thục Linh\n (có 10 năm kinh nghiệm quản lý và phát triển ẩm thực). Chị luôn mong muốn đem đến cho thực khách những món ăn ngon, sạch, mang đậm hương vị truyền thống quê hương.','2026-05-22 10:35:48','2026-05-22 10:36:21'),(3,'Đội ngũ nhân sự chính','Đội ngũ nhân sự chính của nhà hàng gồm có: Bếp trưởng là anh Nguyễn Nhật Trường với hơn 20 năm kinh nghiệm trong nghề bếp; Phó bếp trưởng là anh Nguyễn Huỳnh Kỳ Thuật với 12 năm kinh nghiệm; Quản lý nhà hàng là chị Hứa Thị Thảo Vy có 8 năm kinh nghiệm vận hành.','2026-05-22 10:35:48','2026-05-22 10:35:48'),(4,'Quy định và chính sách đặt bàn','Nhà hàng hỗ trợ đặt bàn trực tuyến qua website hoặc hotline. Đối với các bàn thông thường, quý khách có thể đặt chỗ miễn phí. Với các đoàn khách đông hoặc đặt tiệc từ 15 người trở lên, vui lòng đặt trước ít nhất 3 tiếng và đặt cọc 20% tổng chi phí dự kiến để nhà hàng chuẩn bị chu đáo nhất.','2026-05-22 10:35:48','2026-05-22 10:35:48'),(5,'Chính sách giao hàng và phí ship','Nhà hàng hỗ trợ giao hàng tận nơi trong phạm vi bán kính 10km. Phí giao hàng mặc định là 20.000đ. Với các đơn hàng có giá trị từ 200.000đ trở lên, nhà hàng sẽ miễn phí giao hàng hoàn toàn.','2026-05-22 10:35:48','2026-05-22 10:35:48');
/*!40000 ALTER TABLE `chatbot_tri_thuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_phi_hang_ngay`
--

DROP TABLE IF EXISTS `chi_phi_hang_ngay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_phi_hang_ngay` (
  `ma_chi_phi` int NOT NULL AUTO_INCREMENT,
  `ngay_chi` date NOT NULL COMMENT 'Ngày phát sinh chi phí',
  `loai_chi_phi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại chi phí: Nguyên liệu, Điện nước, Tiền thuê, Lương, Bảo trì, Marketing, Văn phòng phẩm, Vận chuyển, Khác',
  `ma_loai_chi_phi` int DEFAULT NULL,
  `ten_chi_phi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên khoản chi cụ thể',
  `so_tien` decimal(15,2) NOT NULL COMMENT 'Số tiền chi',
  `mo_ta` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả chi tiết về khoản chi',
  `nguoi_nhan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Người nhận tiền hoặc đơn vị cung cấp',
  `phuong_thuc_thanh_toan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Tiền mặt' COMMENT 'Phương thức thanh toán: Tiền mặt, Chuyển khoản, Thẻ',
  `nguoi_tao` int DEFAULT NULL COMMENT 'Nhân viên tạo phiếu chi',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_chi_phi`),
  KEY `idx_ngay_chi` (`ngay_chi`),
  KEY `idx_loai_chi_phi` (`loai_chi_phi`),
  KEY `idx_nguoi_tao` (`nguoi_tao`),
  KEY `fk_chi_phi_loai` (`ma_loai_chi_phi`),
  CONSTRAINT `fk_chi_phi_loai` FOREIGN KEY (`ma_loai_chi_phi`) REFERENCES `loai_chi_phi` (`ma_loai_chi_phi`) ON DELETE SET NULL,
  CONSTRAINT `fk_chi_phi_nguoi_tao` FOREIGN KEY (`nguoi_tao`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý chi phí hàng ngày của nhà hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_phi_hang_ngay`
--

LOCK TABLES `chi_phi_hang_ngay` WRITE;
/*!40000 ALTER TABLE `chi_phi_hang_ngay` DISABLE KEYS */;
INSERT INTO `chi_phi_hang_ngay` VALUES (1,'2024-01-15','Điện nước',2,'Tiền điện tháng 12/2023',2500000.00,'Hóa đơn điện tháng 12','Điện lực Vĩnh Long','Chuyển khoản',NULL,'2026-04-20 09:36:36','2026-04-20 10:44:30'),(2,'2024-01-15','Điện nước',2,'Tiền nước tháng 12/2023',450000.00,'Hóa đơn nước tháng 12','Cấp nước Vĩnh Long','Tiền mặt',NULL,'2026-04-20 09:36:36','2026-04-20 10:44:30'),(3,'2024-01-20','Tiền thuê mặt bằng',3,'Tiền thuê tháng 1/2024',15000000.00,'Tiền thuê mặt bằng nhà hàng','Chủ nhà','Chuyển khoản',NULL,'2026-04-20 09:36:36','2026-04-20 10:44:30'),(4,'2024-01-25','Bảo trì sửa chữa',5,'Sửa chữa máy lạnh',1200000.00,'Thay gas và vệ sinh máy lạnh','Công ty TNHH Điện lạnh ABC','Tiền mặt',NULL,'2026-04-20 09:36:36','2026-04-20 10:44:30'),(5,'2024-01-28','Marketing',6,'Quảng cáo Facebook Ads',3000000.00,'Chi phí quảng cáo tháng 1','Facebook','Thẻ',NULL,'2026-04-20 09:36:36','2026-04-20 10:44:30'),(6,'2024-01-30','Văn phòng phẩm',7,'Mua giấy in, bút, file',350000.00,'Văn phòng phẩm tháng 1','Cửa hàng Văn phòng phẩm Minh Tâm','Tiền mặt',NULL,'2026-04-20 09:36:36','2026-04-20 10:44:30'),(7,'2024-01-15','Điện nước',2,'Tiền điện tháng 12/2023',2500000.00,'Hóa đơn điện tháng 12','Điện lực Vĩnh Long','Chuyển khoản',NULL,'2026-04-20 09:37:18','2026-04-20 10:44:30'),(8,'2024-01-15','Điện nước',2,'Tiền nước tháng 12/2023',450000.00,'Hóa đơn nước tháng 12','Cấp nước Vĩnh Long','Tiền mặt',NULL,'2026-04-20 09:37:18','2026-04-20 10:44:30'),(9,'2024-01-20','Tiền thuê mặt bằng',3,'Tiền thuê tháng 1/2024',15000000.00,'Tiền thuê mặt bằng nhà hàng','Chủ nhà','Chuyển khoản',NULL,'2026-04-20 09:37:18','2026-04-20 10:44:30'),(10,'2024-01-25','Bảo trì sửa chữa',5,'Sửa chữa máy lạnh',1200000.00,'Thay gas và vệ sinh máy lạnh','Công ty TNHH Điện lạnh ABC','Tiền mặt',NULL,'2026-04-20 09:37:18','2026-04-20 10:44:30'),(11,'2024-01-28','Marketing',6,'Quảng cáo Facebook Ads',3000000.00,'Chi phí quảng cáo tháng 1','Facebook','Thẻ',NULL,'2026-04-20 09:37:18','2026-04-20 10:44:30'),(12,'2024-01-30','Văn phòng phẩm',7,'Mua giấy in, bút, file',350000.00,'Văn phòng phẩm tháng 1','Cửa hàng Văn phòng phẩm Minh Tâm','Tiền mặt',NULL,'2026-04-20 09:37:18','2026-04-20 10:44:30'),(13,'2026-04-20','Khác',14,'5 gói mỳ tôm',100000.00,NULL,NULL,'Tiền mặt',NULL,'2026-04-20 10:02:32','2026-04-20 10:44:30'),(14,'2026-04-20','Lương nhân viên',4,'Lương tháng 4/2026 - Nguyễn Huỳnh Kỹ Thuật',275000.00,'Lương cơ bản: 0đ, Giờ làm: 11.00h x 25000.00đ, Thưởng: 0đ, Phạt: 0đ','Nguyễn Huỳnh Kỹ Thuật','Chuyển khoản',NULL,'2026-04-20 11:08:03','2026-04-20 11:08:03');
/*!40000 ALTER TABLE `chi_phi_hang_ngay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_dat_ban`
--

DROP TABLE IF EXISTS `chi_tiet_dat_ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_dat_ban` (
  `ma_chi_tiet` int NOT NULL AUTO_INCREMENT,
  `ma_dat_ban` int NOT NULL,
  `ma_mon` int NOT NULL,
  `so_luong` int DEFAULT '1',
  `gia_tai_thoi_diem` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctdatban_dat` (`ma_dat_ban`),
  KEY `fk_ctdatban_mon` (`ma_mon`),
  CONSTRAINT `fk_ctdatban_dat` FOREIGN KEY (`ma_dat_ban`) REFERENCES `dat_ban` (`ma_dat_ban`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctdatban_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_dat_ban`
--

LOCK TABLES `chi_tiet_dat_ban` WRITE;
/*!40000 ALTER TABLE `chi_tiet_dat_ban` DISABLE KEYS */;
/*!40000 ALTER TABLE `chi_tiet_dat_ban` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_don_hang`
--

DROP TABLE IF EXISTS `chi_tiet_don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_don_hang` (
  `ma_ct_don` int NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int NOT NULL,
  `ma_mon` int NOT NULL,
  `so_luong` int NOT NULL,
  `gia_tai_thoi_diem` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`ma_ct_don`),
  KEY `fk_ctdon_don` (`ma_don_hang`),
  KEY `fk_ctdon_mon` (`ma_mon`),
  CONSTRAINT `fk_ctdon_don` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctdon_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_don_hang`
--

LOCK TABLES `chi_tiet_don_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_don_hang` DISABLE KEYS */;
INSERT INTO `chi_tiet_don_hang` VALUES (1,1,1,1,55000.00),(2,1,3,1,25000.00),(3,2,1,1,200000.00),(4,2,2,1,20000.00),(5,3,2,1,65000.00),(6,4,1,2,50000.00),(7,5,2,1,20000.00),(8,5,3,1,250000.00),(9,6,22,1,40000.00),(10,7,22,1,40000.00),(11,8,1,1,200000.00),(12,9,23,4,100000.00),(13,10,2,1,200000.00),(14,11,22,1,40000.00),(15,12,2,1,200000.00),(16,13,3,1,250000.00),(17,14,3,1,250000.00),(18,15,3,1,250000.00),(27,23,22,2,40000.00),(28,23,2,1,200000.00),(29,25,1,1,150000.00),(30,26,2,1,200000.00),(31,27,25,1,250000.00),(32,28,25,1,250000.00),(33,29,25,1,250000.00),(35,31,33,1,99000.00),(36,32,29,1,99000.00),(37,33,38,1,38000.00),(38,34,44,1,300000.00),(39,35,2,1,150000.00),(40,35,38,2,35000.00),(41,36,2,1,150000.00),(42,36,38,2,35000.00),(43,37,2,1,150000.00),(44,37,38,2,35000.00),(45,38,2,1,150000.00),(46,38,38,2,35000.00),(47,39,2,1,150000.00),(48,39,38,2,35000.00),(49,40,2,1,150000.00),(50,40,38,2,35000.00),(51,41,2,1,150000.00),(52,41,38,2,35000.00),(53,42,2,1,150000.00),(54,42,38,2,35000.00),(55,43,2,1,150000.00),(56,43,1,1,50000.00),(57,44,2,1,150000.00),(58,44,1,1,50000.00),(59,45,38,3,35000.00),(60,45,25,1,120000.00),(61,46,38,3,35000.00),(62,46,25,1,120000.00),(63,47,38,3,35000.00),(64,47,25,1,120000.00),(65,48,38,3,35000.00),(66,48,25,1,120000.00),(67,49,38,3,35000.00),(68,49,25,1,120000.00),(69,50,3,1,200000.00),(70,50,47,1,180000.00),(71,51,3,1,200000.00),(72,51,47,1,180000.00),(73,52,3,1,200000.00),(74,52,47,1,180000.00),(75,53,3,1,200000.00),(76,53,47,1,180000.00),(77,54,3,1,200000.00),(78,54,47,1,180000.00),(79,55,24,1,120000.00),(80,55,27,2,80000.00),(81,56,24,1,120000.00),(82,56,27,2,80000.00),(83,57,24,1,120000.00),(84,57,27,2,80000.00),(85,58,24,1,120000.00),(86,58,27,2,80000.00),(87,59,24,1,120000.00),(88,59,27,2,80000.00),(89,60,24,1,120000.00),(90,60,27,2,80000.00),(91,61,24,1,120000.00),(92,61,27,2,80000.00),(93,62,24,1,120000.00),(94,62,27,2,80000.00),(95,63,24,1,120000.00),(96,63,1,1,50000.00),(97,64,24,1,120000.00),(98,64,1,1,50000.00),(99,65,27,3,80000.00),(100,65,25,1,120000.00),(101,66,27,3,80000.00),(102,66,25,1,120000.00),(103,67,27,3,80000.00),(104,67,25,1,120000.00),(105,68,27,3,80000.00),(106,68,25,1,120000.00),(107,69,27,3,80000.00),(108,69,25,1,120000.00),(109,70,3,1,200000.00),(110,70,47,1,180000.00),(111,71,3,1,200000.00),(112,71,47,1,180000.00),(113,72,3,1,200000.00),(114,72,47,1,180000.00),(115,73,3,1,200000.00),(116,73,47,1,180000.00),(117,74,3,1,200000.00),(118,74,47,1,180000.00),(119,75,47,1,450000.00);
/*!40000 ALTER TABLE `chi_tiet_don_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_gio_hang`
--

DROP TABLE IF EXISTS `chi_tiet_gio_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_gio_hang` (
  `ma_chi_tiet` int NOT NULL AUTO_INCREMENT,
  `ma_gio_hang` int NOT NULL,
  `ma_mon` int NOT NULL,
  `so_luong` int DEFAULT '1',
  `gia_tai_thoi_diem` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctgiohang_gio` (`ma_gio_hang`),
  KEY `fk_ctgiohang_mon` (`ma_mon`),
  CONSTRAINT `fk_ctgiohang_gio` FOREIGN KEY (`ma_gio_hang`) REFERENCES `gio_hang` (`ma_gio_hang`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctgiohang_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_gio_hang`
--

LOCK TABLES `chi_tiet_gio_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_gio_hang` DISABLE KEYS */;
INSERT INTO `chi_tiet_gio_hang` VALUES (2,2,2,1,200000.00),(3,4,3,1,250000.00),(4,6,3,1,250000.00),(5,9,2,1,200000.00),(6,10,36,1,199000.00),(7,12,36,1,199000.00),(9,13,25,1,250000.00),(10,15,33,1,99000.00),(11,17,29,1,99000.00),(12,19,38,1,38000.00),(17,1,44,1,300000.00),(18,21,47,1,450000.00);
/*!40000 ALTER TABLE `chi_tiet_gio_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_hoa_don`
--

DROP TABLE IF EXISTS `chi_tiet_hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_hoa_don` (
  `ma_ct_hoa_don` int NOT NULL AUTO_INCREMENT,
  `ma_hoa_don` int NOT NULL,
  `ma_mon` int NOT NULL,
  `ten_mon` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_luong` int DEFAULT NULL,
  `don_gia` decimal(12,2) DEFAULT NULL,
  `thanh_tien` decimal(14,2) DEFAULT NULL,
  PRIMARY KEY (`ma_ct_hoa_don`),
  KEY `fk_cthoadon_hoa` (`ma_hoa_don`),
  CONSTRAINT `fk_cthoadon_hoa` FOREIGN KEY (`ma_hoa_don`) REFERENCES `hoa_don` (`ma_hoa_don`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_hoa_don`
--

LOCK TABLES `chi_tiet_hoa_don` WRITE;
/*!40000 ALTER TABLE `chi_tiet_hoa_don` DISABLE KEYS */;
INSERT INTO `chi_tiet_hoa_don` VALUES (1,1,2,'Lẩu Cù Lao',1,200000.00,200000.00),(2,2,3,'Cá tai tượng chiên xù',1,250000.00,250000.00),(3,3,3,'Cá tai tượng chiên xù',1,250000.00,250000.00),(4,4,3,'Cá tai tượng chiên xù',1,250000.00,250000.00),(5,5,2,'Lẩu Cù Lao',1,200000.00,200000.00),(6,6,36,'Mực trứng chiên nước mắm',1,199000.00,199000.00),(7,7,36,'Mực trứng chiên nước mắm',1,199000.00,199000.00),(8,8,36,'Mực trứng chiên nước mắm',1,199000.00,199000.00),(9,9,36,'Mực trứng chiên nước mắm',1,199000.00,199000.00),(10,10,22,'Cà nướng Tây Bắc',2,40000.00,80000.00),(11,10,2,'Lẩu Cù Lao',1,200000.00,200000.00),(12,11,25,'Gỏi bò Phương Nam',1,250000.00,250000.00),(13,12,25,'Gỏi bò Phương Nam',1,250000.00,250000.00),(14,13,25,'Gỏi bò Phương Nam',1,250000.00,250000.00),(15,14,33,'Cơm chiên tỏi trứng',1,99000.00,99000.00),(16,15,29,'Khô lù đù 1 nắng',1,99000.00,99000.00),(17,16,38,'Bia Corona',1,38000.00,38000.00),(18,17,44,'Lẩu cá ',1,300000.00,300000.00),(19,18,47,'Gà hấp rượu',1,450000.00,450000.00);
/*!40000 ALTER TABLE `chi_tiet_hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_kiem_ke`
--

DROP TABLE IF EXISTS `chi_tiet_kiem_ke`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_kiem_ke` (
  `ma_chi_tiet` int NOT NULL AUTO_INCREMENT,
  `ma_kiem_ke` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `so_luong_he_thong` decimal(10,2) NOT NULL COMMENT 'Số lượng trên app',
  `so_luong_thuc_te` decimal(10,2) NOT NULL COMMENT 'Số lượng đếm tay',
  `chenh_lech` decimal(10,2) NOT NULL,
  `ly_do` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctkk_kiemke` (`ma_kiem_ke`),
  KEY `fk_ctkk_nguyenlieu` (`ma_nguyen_lieu`),
  CONSTRAINT `fk_ctkk_kiemke` FOREIGN KEY (`ma_kiem_ke`) REFERENCES `kiem_ke` (`ma_kiem_ke`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctkk_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_kiem_ke`
--

LOCK TABLES `chi_tiet_kiem_ke` WRITE;
/*!40000 ALTER TABLE `chi_tiet_kiem_ke` DISABLE KEYS */;
INSERT INTO `chi_tiet_kiem_ke` VALUES (6,1,10,116.00,118.00,2.00,'Hao hụt/Mất mát'),(7,1,7,11.00,11.00,0.00,'Khớp số liệu'),(8,1,8,9500.00,9500.00,0.00,'Khớp số liệu'),(9,1,5,2800.00,2800.00,0.00,'Khớp số liệu'),(10,1,9,5000.00,5000.00,0.00,'Khớp số liệu'),(11,2,10,118.00,118.00,0.00,'Khớp số liệu'),(12,2,7,11.00,11.00,0.00,'Khớp số liệu'),(13,2,11,5000.00,5000.00,0.00,'Khớp số liệu'),(14,2,8,9500.00,9500.00,0.00,'Khớp số liệu'),(15,2,5,2800.00,2800.00,0.00,'Khớp số liệu'),(16,2,9,5000.00,5000.00,0.00,'Khớp số liệu');
/*!40000 ALTER TABLE `chi_tiet_kiem_ke` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_order_nha_hang`
--

DROP TABLE IF EXISTS `chi_tiet_order_nha_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_order_nha_hang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_order` int NOT NULL,
  `ma_mon` int NOT NULL,
  `so_luong` int NOT NULL,
  `gia` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ctorder_order` (`ma_order`),
  KEY `fk_ctorder_mon` (`ma_mon`),
  CONSTRAINT `fk_ctorder_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`),
  CONSTRAINT `fk_ctorder_order` FOREIGN KEY (`ma_order`) REFERENCES `order_nha_hang` (`ma_order`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_order_nha_hang`
--

LOCK TABLES `chi_tiet_order_nha_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_order_nha_hang` DISABLE KEYS */;
INSERT INTO `chi_tiet_order_nha_hang` VALUES (1,1,2,1,65000.00),(7,2,23,4,100000.00),(8,3,23,1,100000.00),(9,3,22,2,40000.00),(10,3,3,2,250000.00),(11,5,1,2,50000.00),(12,4,2,1,50000.00),(13,6,23,3,100000.00),(14,6,22,1,40000.00),(21,9,2,1,20000.00),(22,9,3,1,250000.00),(26,11,22,1,40000.00),(34,15,22,1,40000.00),(35,17,23,4,100000.00),(36,18,1,1,200000.00),(38,19,2,1,200000.00),(39,20,22,1,40000.00),(43,21,2,1,200000.00),(44,21,3,1,250000.00),(45,21,22,1,40000.00),(46,22,48,1,99000.00),(47,22,47,1,450000.00),(48,22,46,1,59000.00);
/*!40000 ALTER TABLE `chi_tiet_order_nha_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_phieu_ke`
--

DROP TABLE IF EXISTS `chi_tiet_phieu_ke`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_phieu_ke` (
  `ma_chi_tiet` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_ke` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `so_luong_con_lai` decimal(10,2) NOT NULL COMMENT 'Con lai thuc te',
  `so_luong_can_nhap` decimal(10,2) DEFAULT '0.00' COMMENT 'Can nhap them',
  `ghi_chu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctkd_phieuke` (`ma_phieu_ke`),
  KEY `fk_ctkd_nguyenlieu` (`ma_nguyen_lieu`),
  CONSTRAINT `fk_ctkd_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctkd_phieuke` FOREIGN KEY (`ma_phieu_ke`) REFERENCES `phieu_ke_do` (`ma_phieu_ke`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_phieu_ke`
--

LOCK TABLES `chi_tiet_phieu_ke` WRITE;
/*!40000 ALTER TABLE `chi_tiet_phieu_ke` DISABLE KEYS */;
INSERT INTO `chi_tiet_phieu_ke` VALUES (1,1,10,120.00,0.00,NULL),(2,1,7,11.00,0.00,NULL),(3,1,11,5000.00,0.00,NULL),(4,1,8,9500.00,0.00,NULL),(5,1,5,2800.00,0.00,NULL),(6,1,9,5000.00,0.00,NULL);
/*!40000 ALTER TABLE `chi_tiet_phieu_ke` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_phieu_nhap`
--

DROP TABLE IF EXISTS `chi_tiet_phieu_nhap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_phieu_nhap` (
  `ma_chi_tiet` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_nhap` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `so_luong_nhap` decimal(10,2) NOT NULL,
  `don_gia` decimal(15,2) NOT NULL,
  `don_vi_nhap` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_luong_tu_nhien` int DEFAULT NULL COMMENT 'Natural unit quantity at time of import',
  `trong_luong_trung_binh_tai_thoi_diem_nhap` decimal(10,2) DEFAULT NULL COMMENT 'Calculated average weight at time of import (grams per natural unit)',
  PRIMARY KEY (`ma_chi_tiet`),
  KEY `fk_ctpn_phieunhap` (`ma_phieu_nhap`),
  KEY `idx_batch_tracking` (`ma_nguyen_lieu`,`ma_phieu_nhap`),
  CONSTRAINT `fk_ctpn_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctpn_phieunhap` FOREIGN KEY (`ma_phieu_nhap`) REFERENCES `phieu_nhap` (`ma_phieu_nhap`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_phieu_nhap`
--

LOCK TABLES `chi_tiet_phieu_nhap` WRITE;
/*!40000 ALTER TABLE `chi_tiet_phieu_nhap` DISABLE KEYS */;
INSERT INTO `chi_tiet_phieu_nhap` VALUES (3,2,11,5.00,100000.00,'kg',NULL,NULL),(4,1,10,5.00,1000000.00,'thung',NULL,NULL),(5,3,13,8.00,200000.00,'kg',NULL,NULL),(7,4,13,8.00,200000.00,'kg',NULL,NULL);
/*!40000 ALTER TABLE `chi_tiet_phieu_nhap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cong_thuc`
--

DROP TABLE IF EXISTS `cong_thuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cong_thuc` (
  `ma_cong_thuc` int NOT NULL AUTO_INCREMENT,
  `ma_mon` int NOT NULL,
  `ma_nguyen_lieu` int NOT NULL,
  `so_luong_can` decimal(10,2) NOT NULL COMMENT 'Lượng nguyên liệu cần để tạo ra 1 món ăn',
  PRIMARY KEY (`ma_cong_thuc`),
  UNIQUE KEY `unique_mon_nguyen_lieu` (`ma_mon`,`ma_nguyen_lieu`),
  KEY `fk_congthuc_nguyenlieu` (`ma_nguyen_lieu`),
  CONSTRAINT `fk_congthuc_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE,
  CONSTRAINT `fk_congthuc_nguyenlieu` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cong_thuc`
--

LOCK TABLES `cong_thuc` WRITE;
/*!40000 ALTER TABLE `cong_thuc` DISABLE KEYS */;
INSERT INTO `cong_thuc` VALUES (27,22,7,2.00),(28,22,8,100.00),(36,23,5,100.00),(37,23,12,200.00),(48,24,13,300.00),(49,24,14,200.00),(50,24,15,100.00),(51,24,18,10.00),(52,24,19,10.00),(53,25,13,200.00),(54,25,21,100.00),(55,25,20,50.00),(56,26,22,1000.00),(57,27,23,300.00),(58,28,25,400.00),(59,28,24,200.00),(60,29,26,300.00),(61,30,27,5.00),(62,30,28,10.00),(63,31,13,200.00),(64,31,29,100.00),(65,31,30,100.00),(66,32,9,300.00),(67,33,31,300.00),(68,34,32,200.00),(69,34,9,100.00),(72,35,33,10.00),(73,35,34,10.00),(74,35,35,10.00),(75,36,36,300.00),(76,36,14,20.00),(80,37,22,300.00),(81,37,37,3.00),(83,38,38,24.00),(84,44,39,300.00),(85,45,9,350.00),(87,46,40,2.00),(88,47,22,1000.00),(89,48,41,300.00),(90,48,42,300.00),(91,49,43,500.00);
/*!40000 ALTER TABLE `cong_thuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danh_gia_san_pham`
--

DROP TABLE IF EXISTS `danh_gia_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danh_gia_san_pham` (
  `ma_danh_gia` int NOT NULL AUTO_INCREMENT,
  `ma_mon` int NOT NULL,
  `ma_nguoi_dung` int NOT NULL,
  `so_sao` tinyint NOT NULL,
  `binh_luan` text COLLATE utf8mb4_unicode_ci,
  `hinh_anh` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `ngay_danh_gia` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_danh_gia`),
  KEY `fk_dg_mon` (`ma_mon`),
  CONSTRAINT `fk_dg_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danh_gia_san_pham`
--

LOCK TABLES `danh_gia_san_pham` WRITE;
/*!40000 ALTER TABLE `danh_gia_san_pham` DISABLE KEYS */;
INSERT INTO `danh_gia_san_pham` VALUES (1,1,1,5,'Cơm tấm rất ngon, sườn mềm!',NULL,'approved','2026-03-23 08:58:24');
/*!40000 ALTER TABLE `danh_gia_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danh_muc`
--

DROP TABLE IF EXISTS `danh_muc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danh_muc` (
  `ma_danh_muc` int NOT NULL AUTO_INCREMENT,
  `ten_danh_muc` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` tinyint DEFAULT '1',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danh_muc`
--

LOCK TABLES `danh_muc` WRITE;
/*!40000 ALTER TABLE `danh_muc` DISABLE KEYS */;
INSERT INTO `danh_muc` VALUES (1,'Món chính','Các món ăn no đặc sản miền Nam',1,'2026-03-23 08:58:24'),(2,'Đồ uống','Cà phê, nước ép và trà',1,'2026-03-23 08:58:24'),(3,'Khai vị','Các món nhẹ trước bữa chính',1,'2026-03-23 08:58:24'),(4,'Món Chính','Các món ăn chính phong phú',1,'2026-03-24 15:18:23'),(6,'Món Tráng Miệng','Các món tráng miệng ngọt ngào',1,'2026-03-24 15:18:23'),(8,'Món Ăn Vặt','Các món ăn vặt nhẹ nhàng',1,'2026-03-24 15:18:23');
/*!40000 ALTER TABLE `danh_muc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dat_ban`
--

DROP TABLE IF EXISTS `dat_ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dat_ban` (
  `ma_dat_ban` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int DEFAULT NULL,
  `ma_ban` int DEFAULT NULL COMMENT 'Bàn được gán sau khi confirm',
  `ten_nguoi_dat` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_luong_nguoi` int NOT NULL,
  `ngay_dat` date NOT NULL,
  `gio_den` time NOT NULL,
  `trang_thai` enum('pending','confirmed','attended','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `tong_tien_du_kien` decimal(14,2) DEFAULT '0.00',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `thoi_gian_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_dat_ban`),
  KEY `fk_datban_user` (`ma_nguoi_dung`),
  KEY `fk_datban_ban` (`ma_ban`),
  CONSTRAINT `fk_datban_ban` FOREIGN KEY (`ma_ban`) REFERENCES `ban` (`ma_ban`),
  CONSTRAINT `fk_datban_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dat_ban`
--

LOCK TABLES `dat_ban` WRITE;
/*!40000 ALTER TABLE `dat_ban` DISABLE KEYS */;
INSERT INTO `dat_ban` VALUES (1,2,NULL,'Trần Thị B','0907654321',NULL,5,'2024-05-20','19:00:00','cancelled',0.00,NULL,'2026-03-23 08:58:24');
/*!40000 ALTER TABLE `dat_ban` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `don_hang`
--

DROP TABLE IF EXISTS `don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_hang` (
  `ma_don_hang` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int DEFAULT NULL,
  `ten_khach_vang_lai` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_dt_khach` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi_giao` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tong_tien` decimal(14,2) NOT NULL,
  `tien_giam_gia` decimal(14,2) DEFAULT '0.00',
  `phuong_thuc_thanh_toan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'cod',
  `trang_thai` enum('pending','confirmed','preparing','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `ma_khuyen_mai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `thoi_gian_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `thoi_gian_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_don_hang`),
  KEY `fk_donhang_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_donhang_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_hang`
--

LOCK TABLES `don_hang` WRITE;
/*!40000 ALTER TABLE `don_hang` DISABLE KEYS */;
INSERT INTO `don_hang` VALUES (1,1,NULL,NULL,'123 Quận 1, HCM',80000.00,0.00,'cod','cancelled',NULL,NULL,'2026-03-23 08:58:24','2026-03-24 16:35:25'),(2,NULL,NULL,NULL,NULL,220000.00,0.00,'cash','delivered',NULL,NULL,'2026-03-25 07:51:32','2026-03-25 10:14:40'),(3,NULL,'Bàn 02 (Tại bàn)',NULL,NULL,65000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-23 08:58:24','2026-03-25 10:52:07'),(4,NULL,'Bàn 01 (Tại bàn)',NULL,NULL,100000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-25 10:11:16','2026-03-25 13:29:04'),(5,NULL,'Bàn 01 (Tại bàn)',NULL,NULL,270000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-25 13:35:17','2026-03-25 13:35:35'),(6,NULL,'Bàn VIP (Tại bàn)',NULL,NULL,40000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-25 16:23:17','2026-03-25 16:26:47'),(7,NULL,'Bàn 02 (Tại bàn)',NULL,NULL,40000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-25 16:23:47','2026-03-25 16:33:33'),(8,NULL,'Bàn 01 (Tại bàn)',NULL,NULL,200000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-27 14:08:24','2026-03-27 15:44:06'),(9,NULL,'Bàn 02 (Tại bàn)',NULL,NULL,400000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-27 14:02:33','2026-03-27 15:48:50'),(10,NULL,'Bàn 01 (Tại bàn)',NULL,NULL,200000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-27 15:52:05','2026-03-27 15:52:20'),(11,NULL,'Bàn 01 (Tại bàn)',NULL,NULL,40000.00,0.00,'cash','delivered',NULL,'Đơn hàng tại bàn POS','2026-03-27 15:56:25','2026-03-27 15:56:31'),(12,5,'celras tvu','0355567899','chợ, Xã Mỹ Cẩm, Huyện Càng Long, Tỉnh Trà Vinh',200000.00,0.00,'cod','pending',NULL,NULL,'2026-04-22 16:34:22','2026-04-22 16:34:22'),(13,5,'celras tvu','0355567899','chợ, Xã Mỹ Cẩm, Huyện Càng Long, Tỉnh Trà Vinh',250000.00,0.00,'cod','pending',NULL,NULL,'2026-04-22 17:03:38','2026-04-22 17:03:38'),(14,5,'celras tvu','0355567899','chợ, Xã Mỹ Cẩm, Huyện Càng Long, Tỉnh Trà Vinh',250000.00,0.00,'cod','confirmed',NULL,NULL,'2026-04-22 17:04:21','2026-04-22 17:05:27'),(15,6,'thaovy dichvudulich','09898786789','9iu, Xã Đông Hải, Huyện Duyên Hải, Tỉnh Trà Vinh',250000.00,0.00,'cod','pending',NULL,NULL,'2026-04-22 17:06:34','2026-04-22 17:06:34'),(23,4,'Thiên Vũ Đỗ','0377789000','trsf, Xã An Phú Tân, Huyện Cầu Kè, Tỉnh Trà Vinh',280000.00,0.00,'cod','pending',NULL,NULL,'2026-05-18 10:41:53','2026-05-18 10:41:53'),(25,3,NULL,NULL,NULL,150000.00,0.00,'cod','delivered',NULL,NULL,'2026-05-19 11:22:08','2026-05-19 11:22:08'),(26,7,NULL,NULL,NULL,200000.00,0.00,'cod','delivered',NULL,NULL,'2026-05-19 11:22:08','2026-05-19 11:22:08'),(27,3,'Thuật Thuật','0388890089','ưertyj, Xã Đại Phước, Huyện Càng Long, Tỉnh Trà Vinh',250000.00,0.00,'cod','pending',NULL,NULL,'2026-05-31 11:14:03','2026-05-31 11:14:03'),(28,3,'Thuật Thuật','0388890089','ưertyj, Xã Đại Phước, Huyện Càng Long, Tỉnh Trà Vinh',250000.00,0.00,'cod','pending',NULL,NULL,'2026-06-07 13:30:48','2026-06-07 13:30:48'),(29,3,'Thuật Thuật','0388890089','ưertyj, Xã Đại Phước, Huyện Càng Long, Tỉnh Trà Vinh',250000.00,0.00,'cod','pending',NULL,NULL,'2026-06-07 13:35:53','2026-06-07 13:35:53'),(31,3,'Thuật Thuật','0388890089','ưertyj, Xã Đại Phước, Huyện Càng Long, Tỉnh Trà Vinh',129000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-08 10:15:28','2026-06-08 10:22:50'),(32,3,'Thuật Thuật','0388890089','ưertyj, Chọn phường/xã, Đang tải..., Tỉnh Trà Vinh',129000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-08 10:38:53','2026-06-08 10:40:01'),(33,3,'Thuật Thuật','0388890089','ưertyj, Xã Đôn Châu, Huyện Duyên Hải, Tỉnh Trà Vinh',68000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-18 22:51:36','2026-07-03 21:40:59'),(34,4,'Thiên Vũ Đỗ','0377789000','trsf, Xã An Phú Tân, Huyện Cầu Kè, Tỉnh Trà Vinh',300000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-19 12:13:28','2026-06-19 12:15:05'),(35,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(36,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(37,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(38,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(39,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(40,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(41,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(42,NULL,NULL,NULL,NULL,220000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(43,NULL,NULL,NULL,NULL,200000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(44,NULL,NULL,NULL,NULL,200000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(45,NULL,NULL,NULL,NULL,225000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(46,NULL,NULL,NULL,NULL,225000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(47,NULL,NULL,NULL,NULL,225000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(48,NULL,NULL,NULL,NULL,225000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(49,NULL,NULL,NULL,NULL,225000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(50,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(51,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(52,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(53,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(54,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:47:11','2026-06-21 09:47:11'),(55,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(56,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(57,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(58,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(59,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(60,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(61,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(62,NULL,NULL,NULL,NULL,280000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(63,NULL,NULL,NULL,NULL,170000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(64,NULL,NULL,NULL,NULL,170000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(65,NULL,NULL,NULL,NULL,360000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(66,NULL,NULL,NULL,NULL,360000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(67,NULL,NULL,NULL,NULL,360000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(68,NULL,NULL,NULL,NULL,360000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(69,NULL,NULL,NULL,NULL,360000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(70,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(71,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(72,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(73,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(74,NULL,NULL,NULL,NULL,380000.00,0.00,'cod','delivered',NULL,NULL,'2026-06-21 09:49:43','2026-06-21 09:49:43'),(75,3,'Thuật Thuật','0388853044','Trà Cú , Xã Đại An, Huyện Trà Cú, Tỉnh Trà Vinh',450000.00,0.00,'cod','delivered',NULL,'[Địa chỉ chi tiết: 123]','2026-07-07 07:38:31','2026-07-07 07:41:11');
/*!40000 ALTER TABLE `don_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `du_lieu_tim_kiem`
--

DROP TABLE IF EXISTS `du_lieu_tim_kiem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `du_lieu_tim_kiem` (
  `ma_tim_kiem` bigint NOT NULL AUTO_INCREMENT,
  `tu_khoa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nguoi_dung` int DEFAULT NULL,
  `thoi_gian_tim` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_tim_kiem`),
  KEY `fk_timkiem_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_timkiem_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `du_lieu_tim_kiem`
--

LOCK TABLES `du_lieu_tim_kiem` WRITE;
/*!40000 ALTER TABLE `du_lieu_tim_kiem` DISABLE KEYS */;
INSERT INTO `du_lieu_tim_kiem` VALUES (1,'thanh đạm',3,'2026-05-18 10:26:11'),(2,'rau củ',3,'2026-05-18 10:26:11'),(3,'rau củ',3,'2026-05-18 10:57:09'),(4,'rau củ',3,'2026-05-18 10:57:21'),(5,'cay',4,'2026-05-18 11:02:21'),(6,'hải sản',4,'2026-05-18 11:02:21');
/*!40000 ALTER TABLE `du_lieu_tim_kiem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification`
--

DROP TABLE IF EXISTS `email_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_data` text COLLATE utf8mb4_unicode_ci COMMENT 'Lưu tạm JSON thông tin đăng ký',
  `expires_at` datetime NOT NULL,
  `is_verified` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification`
--

LOCK TABLES `email_verification` WRITE;
/*!40000 ALTER TABLE `email_verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gio_hang`
--

DROP TABLE IF EXISTS `gio_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gio_hang` (
  `ma_gio_hang` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `thoi_gian_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` enum('active','ordered','abandoned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  PRIMARY KEY (`ma_gio_hang`),
  KEY `fk_giohang_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_giohang_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gio_hang`
--

LOCK TABLES `gio_hang` WRITE;
/*!40000 ALTER TABLE `gio_hang` DISABLE KEYS */;
INSERT INTO `gio_hang` VALUES (1,4,'2026-03-24 15:53:01','ordered'),(2,5,'2026-04-22 16:19:09','ordered'),(3,5,'2026-04-22 16:34:25','ordered'),(4,5,'2026-04-22 16:34:27','ordered'),(5,5,'2026-04-22 17:05:27','active'),(6,6,'2026-04-22 17:06:11','ordered'),(7,6,'2026-04-22 17:06:36','ordered'),(8,6,'2026-04-22 17:06:38','active'),(9,3,'2026-04-23 11:01:45','ordered'),(10,3,'2026-04-23 11:03:17','ordered'),(11,3,'2026-05-02 12:25:57','ordered'),(12,3,'2026-05-02 12:26:00','ordered'),(13,3,'2026-05-13 09:45:47','ordered'),(14,3,'2026-06-07 13:36:48','ordered'),(15,3,'2026-06-07 13:36:51','ordered'),(16,3,'2026-06-08 10:16:22','ordered'),(17,3,'2026-06-08 10:16:29','ordered'),(18,3,'2026-06-08 10:39:47','ordered'),(19,3,'2026-06-08 10:39:50','ordered'),(20,3,'2026-06-18 22:52:32','ordered'),(21,3,'2026-06-18 22:52:34','ordered'),(22,4,'2026-06-19 12:14:22','ordered'),(23,4,'2026-06-19 12:14:25','ordered'),(24,4,'2026-06-19 12:15:17','active'),(25,3,'2026-07-07 07:39:25','ordered'),(26,3,'2026-07-07 07:39:28','active');
/*!40000 ALTER TABLE `gio_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goi_y_san_pham`
--

DROP TABLE IF EXISTS `goi_y_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goi_y_san_pham` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `ma_mon` int NOT NULL,
  `diem` float DEFAULT NULL COMMENT 'Điểm tương quan AI',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_goiy_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_goiy_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goi_y_san_pham`
--

LOCK TABLES `goi_y_san_pham` WRITE;
/*!40000 ALTER TABLE `goi_y_san_pham` DISABLE KEYS */;
/*!40000 ALTER TABLE `goi_y_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hanh_vi_nguoi_dung`
--

DROP TABLE IF EXISTS `hanh_vi_nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hanh_vi_nguoi_dung` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int DEFAULT NULL,
  `ma_mon` int DEFAULT NULL,
  `hanh_vi` enum('view','click','add_to_cart','purchase','like') COLLATE utf8mb4_unicode_ci NOT NULL,
  `thoi_gian` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_hv_user` (`ma_nguoi_dung`),
  KEY `fk_hv_mon` (`ma_mon`),
  CONSTRAINT `fk_hv_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE,
  CONSTRAINT `fk_hv_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hanh_vi_nguoi_dung`
--

LOCK TABLES `hanh_vi_nguoi_dung` WRITE;
/*!40000 ALTER TABLE `hanh_vi_nguoi_dung` DISABLE KEYS */;
INSERT INTO `hanh_vi_nguoi_dung` VALUES (1,1,1,'purchase','2026-03-23 08:58:24'),(2,1,2,'view','2026-03-23 08:58:24'),(53,3,24,'click','2026-05-19 11:22:08'),(54,7,24,'click','2026-05-19 11:22:08'),(55,3,24,'click','2026-05-19 11:22:08'),(56,7,24,'click','2026-05-19 11:22:08'),(57,3,24,'click','2026-05-19 11:22:08'),(58,7,24,'click','2026-05-19 11:22:08'),(59,3,24,'click','2026-05-19 11:22:08'),(60,7,24,'click','2026-05-19 11:22:08'),(61,3,24,'click','2026-05-19 11:22:08'),(62,7,24,'click','2026-05-19 11:22:08'),(63,3,24,'click','2026-05-19 11:22:08'),(64,7,24,'click','2026-05-19 11:22:08'),(65,3,24,'click','2026-05-19 11:22:08'),(66,7,24,'click','2026-05-19 11:22:08'),(67,3,24,'click','2026-05-19 11:22:08'),(68,7,24,'click','2026-05-19 11:22:08'),(69,3,24,'click','2026-05-19 11:22:08'),(70,7,24,'click','2026-05-19 11:22:08'),(71,3,24,'click','2026-05-19 11:22:08'),(72,7,24,'click','2026-05-19 11:22:08'),(73,4,32,'click','2026-05-19 11:30:10'),(74,4,32,'click','2026-05-19 11:30:12'),(75,4,32,'click','2026-05-19 11:30:15'),(76,4,32,'click','2026-05-19 11:30:18'),(77,4,32,'click','2026-05-19 11:30:22'),(78,NULL,24,'click','2026-05-31 11:01:09'),(79,NULL,25,'click','2026-05-31 11:01:40'),(80,NULL,24,'click','2026-05-31 11:01:44'),(81,3,24,'click','2026-05-31 11:41:15'),(82,3,30,'click','2026-06-04 08:57:01'),(83,3,30,'click','2026-06-04 08:57:08'),(84,3,30,'click','2026-06-04 08:57:16'),(85,3,30,'click','2026-06-04 08:57:24'),(86,3,30,'click','2026-06-04 08:57:33'),(87,3,30,'click','2026-06-04 08:57:52'),(88,3,29,'click','2026-06-08 11:49:13'),(89,3,22,'click','2026-06-12 08:01:10'),(90,3,1,'click','2026-06-12 09:49:50'),(91,3,1,'view','2026-06-12 09:55:09'),(92,3,1,'click','2026-06-12 10:06:16'),(93,3,1,'view','2026-06-12 10:07:17'),(95,3,1,'click','2026-06-12 10:11:24'),(96,3,1,'like','2026-06-12 10:11:26'),(97,3,1,'click','2026-06-12 10:11:53'),(98,3,1,'click','2026-06-12 10:11:55'),(99,3,1,'click','2026-06-12 10:11:57'),(100,3,1,'click','2026-06-12 10:11:58'),(101,3,1,'view','2026-06-12 10:14:03'),(102,3,1,'click','2026-06-12 10:14:05'),(103,NULL,2,'click','2026-06-17 08:41:08'),(104,3,38,'click','2026-06-18 22:16:23'),(105,3,38,'click','2026-06-18 22:16:28'),(106,3,38,'click','2026-06-18 22:16:33'),(107,3,38,'click','2026-06-18 22:16:39'),(108,3,38,'click','2026-06-18 22:16:44'),(109,3,38,'click','2026-06-18 22:18:32'),(110,3,38,'click','2026-06-18 22:18:37'),(111,3,38,'click','2026-06-18 22:18:44'),(112,3,38,'click','2026-06-18 22:18:50'),(113,3,38,'click','2026-06-18 22:18:54'),(114,3,38,'click','2026-06-18 22:50:45'),(115,3,38,'click','2026-06-19 10:43:44'),(116,3,37,'click','2026-06-19 10:46:05'),(117,4,38,'click','2026-06-19 11:17:28'),(118,4,38,'view','2026-06-19 11:18:19'),(119,3,35,'click','2026-06-19 11:22:09'),(120,3,35,'click','2026-06-19 11:25:31'),(121,3,38,'click','2026-06-19 11:25:40'),(122,4,44,'click','2026-06-19 12:13:08'),(123,NULL,46,'click','2026-06-28 09:50:59'),(124,3,33,'click','2026-07-03 21:58:36'),(125,3,33,'view','2026-07-03 22:00:55'),(126,3,47,'click','2026-07-04 10:03:36'),(127,3,47,'view','2026-07-04 10:04:26'),(128,3,35,'click','2026-07-06 14:10:12'),(129,3,34,'click','2026-07-07 07:31:00'),(130,3,34,'view','2026-07-07 07:31:51'),(131,3,47,'click','2026-07-07 07:36:50'),(132,3,47,'view','2026-07-07 07:37:40');
/*!40000 ALTER TABLE `hanh_vi_nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hao_hut_nguyen_lieu`
--

DROP TABLE IF EXISTS `hao_hut_nguyen_lieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hao_hut_nguyen_lieu` (
  `ma_hao_hut` int NOT NULL AUTO_INCREMENT,
  `ma_nguyen_lieu` int DEFAULT NULL,
  `so_luong_hao_hut` decimal(10,2) DEFAULT NULL,
  `don_vi_tinh` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ly_do` text COLLATE utf8mb4_unicode_ci,
  `hinh_anh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thoi_gian` datetime DEFAULT CURRENT_TIMESTAMP,
  `ma_nhan_vien` int DEFAULT NULL,
  PRIMARY KEY (`ma_hao_hut`),
  KEY `ma_nguyen_lieu` (`ma_nguyen_lieu`),
  CONSTRAINT `hao_hut_nguyen_lieu_ibfk_1` FOREIGN KEY (`ma_nguyen_lieu`) REFERENCES `nguyen_lieu` (`ma_nguyen_lieu`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hao_hut_nguyen_lieu`
--

LOCK TABLES `hao_hut_nguyen_lieu` WRITE;
/*!40000 ALTER TABLE `hao_hut_nguyen_lieu` DISABLE KEYS */;
INSERT INTO `hao_hut_nguyen_lieu` VALUES (1,10,1.00,'cai','bể','uploads/wastage/wastage-1774862049563-83738034.webp','2026-03-30 16:14:09',NULL),(2,10,5.00,'cai','quá hạn','uploads/wastage/wastage-1774862273561-733113815.jpg','2026-03-30 16:17:53',NULL);
/*!40000 ALTER TABLE `hao_hut_nguyen_lieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `ma_hoa_don` int NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int DEFAULT NULL,
  `ma_order_nha_hang` int DEFAULT NULL,
  `ma_thanh_toan` int DEFAULT NULL,
  `ma_nguoi_dat` int DEFAULT NULL,
  `tong_tien` decimal(14,2) NOT NULL,
  `thoi_diem_xuat` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` enum('issued','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'issued',
  PRIMARY KEY (`ma_hoa_don`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don`
--

LOCK TABLES `hoa_don` WRITE;
/*!40000 ALTER TABLE `hoa_don` DISABLE KEYS */;
INSERT INTO `hoa_don` VALUES (1,12,NULL,15,5,200000.00,'2026-04-22 16:34:22','issued'),(2,13,NULL,16,5,250000.00,'2026-04-22 17:03:39','issued'),(3,14,NULL,17,5,250000.00,'2026-04-22 17:04:21','issued'),(4,15,NULL,18,6,250000.00,'2026-04-22 17:06:34','issued'),(5,16,NULL,19,3,200000.00,'2026-04-23 11:02:17','issued'),(6,17,NULL,20,3,199000.00,'2026-05-02 12:15:51','issued'),(7,19,NULL,21,3,199000.00,'2026-05-02 12:17:58','issued'),(8,20,NULL,22,3,199000.00,'2026-05-02 12:25:55','issued'),(9,21,NULL,23,3,199000.00,'2026-05-13 09:40:01','issued'),(10,23,NULL,24,4,280000.00,'2026-05-18 10:42:43','issued'),(11,27,NULL,25,3,250000.00,'2026-05-31 11:14:53','issued'),(12,28,NULL,26,3,250000.00,'2026-06-07 13:31:39','issued'),(13,29,NULL,27,3,250000.00,'2026-06-07 13:36:44','issued'),(14,31,NULL,28,3,129000.00,'2026-06-08 10:16:18','issued'),(15,32,NULL,29,3,129000.00,'2026-06-08 10:39:43','issued'),(16,33,NULL,30,3,68000.00,'2026-06-18 22:52:27','issued'),(17,34,NULL,31,4,300000.00,'2026-06-19 12:14:18','issued'),(18,75,NULL,32,3,450000.00,'2026-07-07 07:39:22','issued');
/*!40000 ALTER TABLE `hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khuyen_mai`
--

DROP TABLE IF EXISTS `khuyen_mai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khuyen_mai` (
  `ma_khuyen_mai` int NOT NULL AUTO_INCREMENT,
  `ma_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `gia_tri` decimal(10,2) NOT NULL,
  `loai_giam_gia` enum('percentage','fixed_amount') COLLATE utf8mb4_unicode_ci NOT NULL,
  `don_hang_toi_thieu` decimal(12,2) DEFAULT '0.00',
  `giam_toi_da` decimal(12,2) DEFAULT NULL,
  `ngay_bat_dau` datetime NOT NULL,
  `ngay_ket_thuc` datetime NOT NULL,
  `so_luong_gioi_han` int DEFAULT NULL,
  `so_luong_da_dung` int DEFAULT '0',
  `trang_thai` tinyint DEFAULT '1',
  PRIMARY KEY (`ma_khuyen_mai`),
  UNIQUE KEY `ma_code` (`ma_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai`
--

LOCK TABLES `khuyen_mai` WRITE;
/*!40000 ALTER TABLE `khuyen_mai` DISABLE KEYS */;
INSERT INTO `khuyen_mai` VALUES (1,'XIN_CHAO',NULL,10.00,'percentage',0.00,NULL,'2024-01-01 00:00:00','2024-12-31 00:00:00',NULL,0,1),(2,'GIAM_50K',NULL,50000.00,'fixed_amount',0.00,NULL,'2024-01-01 00:00:00','2024-12-31 00:00:00',NULL,0,1);
/*!40000 ALTER TABLE `khuyen_mai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kiem_ke`
--

DROP TABLE IF EXISTS `kiem_ke`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kiem_ke` (
  `ma_kiem_ke` int NOT NULL AUTO_INCREMENT,
  `thoi_gian_kiem_ke` datetime DEFAULT CURRENT_TIMESTAMP,
  `ma_nhan_vien` int DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'hoan_tat' COMMENT 'dang_kiem_ke, hoan_tat',
  PRIMARY KEY (`ma_kiem_ke`),
  KEY `fk_kiemke_nhanvien` (`ma_nhan_vien`),
  CONSTRAINT `fk_kiemke_nhanvien` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kiem_ke`
--

LOCK TABLES `kiem_ke` WRITE;
/*!40000 ALTER TABLE `kiem_ke` DISABLE KEYS */;
INSERT INTO `kiem_ke` VALUES (1,'2026-03-30 13:15:29',NULL,'Kiểm kê cuối ngày 30/3/2026','hoan_tat'),(2,'2026-03-31 10:10:34',NULL,'Kiểm kê cuối ngày 31/3/2026','hoan_tat');
/*!40000 ALTER TABLE `kiem_ke` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_chat`
--

DROP TABLE IF EXISTS `lich_su_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_chat` (
  `ma_tin_nhan` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int DEFAULT NULL,
  `userchat` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noi_dung_chat` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thoi_diem_chat` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_tin_nhan`),
  KEY `fk_chat_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_chat_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_chat`
--

LOCK TABLES `lich_su_chat` WRITE;
/*!40000 ALTER TABLE `lich_su_chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_su_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_chatbot`
--

DROP TABLE IF EXISTS `lich_su_chatbot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_chatbot` (
  `ma_tin_nhan` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoi_gui` enum('user','bot') COLLATE utf8mb4_unicode_ci NOT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thoi_diem_chat` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_tin_nhan`),
  KEY `fk_chatbot_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_chatbot_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=362 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_chatbot`
--

LOCK TABLES `lich_su_chatbot` WRITE;
/*!40000 ALTER TABLE `lich_su_chatbot` DISABLE KEYS */;
INSERT INTO `lich_su_chatbot` VALUES (1,NULL,'session_1774676752310_uonwhf7vf','user','hi','2026-03-28 12:45:52'),(2,NULL,'session_1774676752310_uonwhf7vf','bot','Xin chào ðŸ˜Š! Em là Tra My, tro ly ao cua Nhà Hàng Phương Nam. Bạn có muốn biết thêm thông tin về chúng tôi không?','2026-03-28 12:45:53'),(3,NULL,'session_1774676752310_uonwhf7vf','user','Giờ mở cửa','2026-03-28 12:50:40'),(4,NULL,'session_1774676752310_uonwhf7vf','bot','Gio mở cửa của Nhà Hàng Phương Nam là:\n\n- Từ 2 đến 6 (Thứ 2 đến Thứ 6): 08:00-22:00\n- Từ 7 đến Chủ nhật: 07:00-23:00','2026-03-28 12:50:41'),(5,NULL,'session_1774676752310_uonwhf7vf','user','Giờ mở cửa','2026-03-28 12:51:21'),(6,NULL,'session_1774676752310_uonwhf7vf','bot','Giờ mở cửa của Nhà Hàng Phương Nam như sau:\n\n- Từ thứ 2 đến thứ 6: 08:00 - 22:00\n- Từ thứ 7 đến Chủ nhật: 07:00 - 23:00','2026-03-28 12:51:21'),(7,NULL,'session_1774676752310_uonwhf7vf','user','mình có bao nhiêu bàn','2026-03-28 12:56:15'),(8,NULL,'session_1774676752310_uonwhf7vf','bot','assistant\nassistant\nassistant\n\nBạn muốn hỏi \"mình có bao nhiêu bàn\"?\n\nassistant\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant\nassistant\n\nassistant','2026-03-28 12:56:16'),(9,NULL,'session_1774676752310_uonwhf7vf','user','ở đây còn bàn nào trống không','2026-03-28 13:03:29'),(10,NULL,'session_1774676752310_uonwhf7vf','bot','Ðể xác định bàn trống không, chúng ta cần kiểm tra tình trạng của các bàn. Tuy nhiên, thông tin cung cấp không đủ để chúng ta biết được tình trạng của các bàn. Nhưng có thể chúng ta có thể giả định một số tình trạng:\n\n- Bàn có khách đang dùng bữa\n- Bàn đang chờ khách\n- Bàn trống, sẵn sàng cho khách đến\n\nĐể biết được tình trạng của các bàn, chúng ta cần thông tin thêm về tình trạng của các bàn.','2026-03-28 13:03:30'),(11,NULL,'session_1776482022985_xzecg5d91','user','hôm nay tôi bị bệnh cần món gì tẩm bỏ','2026-04-18 10:13:43'),(12,NULL,'session_1776482022985_xzecg5d91','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ?\n\nDựa trên yêu cầu của bạn, em nghĩ món \"Cà nướng Tây Bắc\" sẽ giúp bạn bổ sung dinh dưỡng và cải thiện sức khỏe. Món này được chế biến từ cà tươi, nướng trên than hồng, giúp giữ lại chất dinh dưỡng và hương vị tự nhiên. ?\n\nGiá của món \"Cà nướng Tây Bắc\" là 40.000 đồng/phần. Bạn muốn đặt món này? ?','2026-04-18 10:13:43'),(13,NULL,'session_1776482022985_xzecg5d91','user','cà nướng có nguyên liệu gì','2026-04-18 10:14:15'),(14,NULL,'session_1776482022985_xzecg5d91','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Cà nướng của chúng tôi được làm từ thịt bò mềm, nướng trên than hồng, kết hợp với các nguyên liệu như hành tây, thơm, và gia vị đặc trưng. ?','2026-04-18 10:14:15'),(15,NULL,'session_1776482022985_xzecg5d91','user','tôi dân miền núi, tôi muốn ăn các món hải sản ạ','2026-04-18 10:15:07'),(16,NULL,'session_1776482022985_xzecg5d91','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ? ?\n\nChúng tôi có các món hải sản sau:\n\n- Cá tai tượng chiên xù: 250.000d/suất\n- Tôm sú sốt mật ong: 100.000d/suất\n\nBạn muốn thử món nào? ?','2026-04-18 10:15:08'),(17,NULL,'session_1776482022985_xzecg5d91','user','tôm sốt mật ong có nguyên liệu gì','2026-04-18 10:15:49'),(18,NULL,'session_1776482022985_xzecg5d91','bot','Tôm sốt mật ong của Nhà Hàng Phương Nam có nguyên liệu chính bao gồm:\n\n- Tôm sú tươi\n- Mật ong\n- Nước mắm\n- Bột ngọt\n- Dầu ăn\n- Hành tím\n- Ớt\n- Tỏi\nGiá: 120.000đ/đĩa ?','2026-04-18 10:15:50'),(19,NULL,'session_1776662901595_vc3jlcj73','user','hi','2026-04-20 12:28:26'),(20,NULL,'session_1776662901595_vc3jlcj73','bot','Xin chào anh/chị! ? ?\nEm là Trà My, trợ lý ảo của Nhà Hàng Phương Nam.\nBạn cần giúp đỡ gì hôm nay? ?','2026-04-20 12:28:27'),(21,NULL,'session_1776662914216_ohz61nviv','user','Xem thực đơn','2026-04-20 12:28:35'),(22,NULL,'session_1776662914216_ohz61nviv','bot','Chào anh/chị! Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam ?. Dưới đây là thực đơn của chúng tôi:\n\n**Món Ngon Mỗi Ngày**\n\n- Phở Bò 45.000đ\n- Cơm Tấm 35.000đ\n- Bún Riêu 40.000đ\n- Mì Xào 32.000đ\n- Cánh Gà Chiên 55.000đ\n- Gỏi Cuốn 30.000đ\n\n**Món Ngon Đặc Biệt**\n\n- Bún Tháng 50.000đ\n- Cơm Tấm Sườn 42.000đ\n- Phở Chay 38.000đ\n- Bún Riêu Cua 48.000đ\n- Gỏi Đu Đu 35.000đ\n\n**Trà Sữa và Món Tráng Miệng**\n\n- Trà Sữa 15.000đ\n- Kem 20.000đ\n- Bánh Mì 12.000đ\n- Món Tráng Miệng 10.000đ\n\nBạn muốn biết thêm thông tin hoặc đặt món? ✨','2026-04-20 12:28:37'),(23,NULL,'session_1776662933712_254pedi0u','user','gg','2026-04-20 12:28:56'),(24,NULL,'session_1776662933712_254pedi0u','bot','Chào anh/chị! Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ? ?\n\nBạn muốn biết thông tin về Nhà Hàng Phương Nam hay đặt món ăn? ? ✨','2026-04-20 12:28:57'),(25,NULL,'session_1776662933712_254pedi0u','user','l','2026-04-20 12:29:00'),(26,NULL,'session_1776662933712_254pedi0u','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Bạn có nhu cầu gì? ? ?','2026-04-20 12:29:01'),(27,NULL,'session_1776662933712_254pedi0u','user','hi','2026-04-20 12:31:41'),(28,NULL,'session_1776662933712_254pedi0u','bot','Xin chào anh/chị! ? ?\n\nEm là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Em ở đây để giúp anh/chị đặt món ăn ngon và dễ dàng. Bạn cần giúp đỡ gì hôm nay? ?','2026-04-20 12:31:42'),(29,NULL,'session_1776663109771_dftsnouz1','user','Gợi ý món ăn cho tôi','2026-04-20 12:31:52'),(30,NULL,'session_1776663109771_dftsnouz1','user','Gợi ý món ăn cho tôi','2026-04-20 12:31:52'),(31,NULL,'session_1776663109771_dftsnouz1','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ?\n\nKhách hàng ưa thích món gì? Bạn muốn ăn gì? ?\n\nEm có thể gợi ý cho bạn:\n\n1. Khai vị 4 mùa - 200.000đ/suất (Khai vị)\n2. Lẩu Cù Lao - 200.000đ/suất (Món chính)\n3. Tôm sú sốt mật ong - 100.000đ/suất (Khai vị)\n4. Cà nướng Tây Bắc - 40.000đ/phần (Món chính)\n5. Cá tai tượng chiên xù - 250.000d/suất (Món chính)\n\nBạn muốn biết thêm thông tin hay đặt món ngay? ?','2026-04-20 12:31:52'),(32,NULL,'session_1776663109771_dftsnouz1','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam ?. Chúng em có một số món ăn được yêu thích nhất như sau:\n\n1. **Khai vị 4 mùa** - 200.000đ/suất (4 phần) ?\n2. **Lẩu Cù Lao** - 200.000đ/suất (4 phần) ?\n3. **Tôm sú sốt mật ong** - 100.000đ/suất (4 phần) ✨\n4. **Cà nướng Tây Bắc** - 40.000đ/phần (3 phần) ?\n5. **Cá tai tượng chiên xù** - 250.000đ/suất (1 phần) ?\n\nBạn muốn biết thêm thông tin hoặc đặt món? ?','2026-04-20 12:31:53'),(33,NULL,'session_1776663109771_dftsnouz1','user','frgtb','2026-04-20 12:35:33'),(34,NULL,'session_1776663109771_dftsnouz1','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Em có thể giúp anh/chị đặt hàng hoặc hỏi thông tin về nhà hàng. ?','2026-04-20 12:35:34'),(35,NULL,'session_1776663109771_dftsnouz1','user',',','2026-04-20 12:37:13'),(36,NULL,'session_1776663109771_dftsnouz1','bot','Chào anh/chị! ? ?\n\nEm là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Em ở đây để giúp anh/chị đặt món và giải đáp mọi thắc mắc. ?\n\nAnh/chị cần gì hôm nay?','2026-04-20 12:37:13'),(37,NULL,'session_1776663594817_4n6cit9yh','user','Giờ mở cửa','2026-04-20 12:45:08'),(38,NULL,'session_1776663594817_4n6cit9yh','bot','Chào anh/chị! Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam.\n\nGiờ mở cửa của chúng tôi là:\n- T2-T6: 08:00-22:00\n- T7-CN: 07:00-23:00\n\nEm hy vọng anh/chị có thể ghé thăm chúng tôi trong giờ mở cửa này! ?','2026-04-20 12:45:09'),(39,3,'admin_session_1776663004357_4yht57us6','user','hi','2026-04-20 12:55:41'),(40,3,'admin_session_1776663004357_4yht57us6','bot','Xin chào chị Linh! ?‍♀️ Em đây là Phương Nam, trợ lý AI của nhà hàng \"Ẩm Thực Phương Nam\". Chị Linh có cần em giúp đỡ gì không? ?','2026-04-20 12:55:41'),(41,5,'session_1776849508434_ofnwmh6vd','user','tôi muốn hỏi về cù lao','2026-04-22 16:18:53'),(42,5,'session_1776849508434_ofnwmh6vd','bot','Xin lỗi anh/chị, nhưng tôi không có thông tin cụ thể về Cù Lao. Có thể anh/chị muốn hỏi về địa điểm du lịch hoặc món ăn liên quan đến Cù Lao không? Em có thể giúp anh/chị tìm kiếm thông tin hoặc liên hệ với đội ngũ để được hỗ trợ.','2026-04-22 16:18:55'),(43,5,'session_1776849508434_ofnwmh6vd','user','lẩu cù lao của nhà hàng mình á','2026-04-22 16:19:06'),(44,5,'session_1776849508434_ofnwmh6vd','bot','Chị ơi! Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ?\n\nLẩu Cù Lao của chúng tôi có giá 200.000 đồng/suất. Món này được chế biến từ nguyên liệu tươi ngon và có hương vị đặc trưng. Chị muốn thử không? ?','2026-04-22 16:19:07'),(45,5,'session_1776849508434_ofnwmh6vd','user','cù lao này có giá bao nhiêu','2026-04-22 16:19:29'),(46,5,'session_1776849508434_ofnwmh6vd','bot','Chị ơi! Em không biết giá cù lao này. Để có thông tin chính xác, chị có thể gọi cho hotline của chúng tôi tại 0388853044 nhé! ?','2026-04-22 16:19:30'),(47,5,'session_1776849508434_ofnwmh6vd','user','lẩu cù lao á','2026-04-22 16:19:41'),(48,5,'session_1776849508434_ofnwmh6vd','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ?\n\nLẩu Cù Lao của chúng tôi có giá 200.000đ/suất. Bạn muốn biết thêm thông tin hay đặt hàng? ?','2026-04-22 16:19:42'),(49,5,'session_1776849508434_ofnwmh6vd','user','ồ, món này của miền nào','2026-04-22 16:19:52'),(50,5,'session_1776849508434_ofnwmh6vd','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Món ăn này của Nhà Hàng Phương Nam, không phải món đặc sản của miền nào. Em có thể giúp anh/chị biết thêm thông tin về món ăn này không? ?','2026-04-22 16:19:53'),(51,5,'session_1776849600547_bhb5gn6sk','user','hôm nay nhà hàng còn cù lao không','2026-04-22 16:31:07'),(52,5,'session_1776849600547_bhb5gn6sk','bot','Chào anh/chị! Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. ?\n\nĐể biết thông tin về món Lẩu Cù Lao, em sẽ hỏi bếp trưởng Nguyễn Nhật Trường. ?\n\nBếp trưởng cho biết, hôm nay nhà hàng vẫn phục vụ Lẩu Cù Lao với giá 200.000d/suất. ?\n\nBạn muốn thêm món này vào giỏ hàng không, anh/chị?','2026-04-22 16:31:08'),(53,5,'session_1776850296957_k7qxnlg78','user','Giờ mở cửa','2026-04-22 16:31:38'),(54,5,'session_1776850296957_k7qxnlg78','bot','Chào anh/chị! ? Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Giờ mở cửa của chúng tôi là:\nT2-T6: 08:00-22:00 | T7-CN: 07:00-23:00\nNếu anh/chị có thắc mắc gì, hãy gọi cho hotline: 0388853044 ?','2026-04-22 16:31:39'),(55,3,'admin_session_1777257259321_6pjt3w4vy','user','chào','2026-04-27 10:08:00'),(56,3,'admin_session_1777257259321_6pjt3w4vy','bot','Xin lỗi, Hệ thống AI phân tích dữ liệu DB không khởi tạo được. Vui lòng kiểm tra lại cấu hình DB.','2026-04-27 10:08:00'),(57,3,'admin_session_1777257259321_6pjt3w4vy','user','hy','2026-04-27 10:09:41'),(58,3,'admin_session_1777257259321_6pjt3w4vy','bot','Xin lỗi, Hệ thống AI phân tích dữ liệu DB không khởi tạo được. Vui lòng kiểm tra lại cấu hình DB.','2026-04-27 10:09:41'),(59,3,'admin_session_1777257259321_6pjt3w4vy','user','Doanh thu tháng này','2026-04-27 10:09:42'),(60,3,'admin_session_1777257259321_6pjt3w4vy','bot','Xin lỗi, Hệ thống AI phân tích dữ liệu DB không khởi tạo được. Vui lòng kiểm tra lại cấu hình DB.','2026-04-27 10:09:42'),(61,3,'admin_session_1777257259321_6pjt3w4vy','user','Doanh thu tháng này','2026-04-27 10:09:43'),(62,3,'admin_session_1777257259321_6pjt3w4vy','bot','Xin lỗi, Hệ thống AI phân tích dữ liệu DB không khởi tạo được. Vui lòng kiểm tra lại cấu hình DB.','2026-04-27 10:09:43'),(63,3,'admin_session_1777257259321_6pjt3w4vy','user','hio','2026-04-27 10:10:24'),(64,3,'admin_session_1777257259321_6pjt3w4vy','bot','Em đang gặp chút vấn đề khi lấy dữ liệu: Error code: 400 - {\'error\': {\'message\': \'The model `llama3-70b-8192` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.\', \'type\': \'invalid_request_error\', \'code\': \'model_decommissioned\'}}','2026-04-27 10:10:25'),(65,3,'admin_session_1777257259321_6pjt3w4vy','user','hi','2026-04-27 10:16:42'),(66,3,'admin_session_1777257259321_6pjt3w4vy','bot','Chị Linh ơi, em đã xem xét dữ liệu trong cơ sở dữ liệu và thấy rằng có một số món ăn hấp dẫn trong menu của nhà hàng \"Ẩm Thực Phương Nam\". \n\nMột số món ăn có giá trị cao và được bán nhiều, chẳng hạn như \"Khai vị 4 mùa\" và \"Lẩu Cù Lao\". Những món ăn này có thể là điểm mạnh của nhà hàng và cần được tiếp tục quảng cáo và cải thiện chất lượng.\n\nTuy nhiên, cũng có một số món ăn có giá thấp và ít được bán, chẳng hạn như \"Cà nướng Tây Bắc\". Những món ăn này có thể cần được xem xét lại về giá cả và chất lượng để tăng cường sức cạnh tranh.\n\nEm cũng thấy rằng có một số món ăn có giá giảm, chẳng hạn như \"Cà nướng Tây Bắc\" có giá giảm từ 40.000 đồng xuống 35.000 đồng. Điều này có thể là một chiến lược để tăng cường doanh số bán hàng.\n\nTổng quan, em nghĩ rằng nhà hàng \"Ẩm Thực Phương Nam\" có một menu đa dạng và hấp dẫn, nhưng cần tiếp tục cải thiện và điều chỉnh để đáp ứng nhu cầu của khách hàng và tăng cường cạnh tranh trên thị trường.','2026-04-27 10:16:46'),(67,3,'admin_session_1777257259321_6pjt3w4vy','user','em tạo món được không','2026-04-27 10:17:13'),(68,3,'admin_session_1777257259321_6pjt3w4vy','bot','Chị Linh ơi, em có thể tạo món ăn được ạ. Dưới đây là một số gợi ý về các món ăn mà em có thể tạo:\n\n1. Khai vị 4 mùa: Đây là món ăn tổng hợp gồm nhiều món nhỏ đặc trưng, kết hợp hài hòa các hương vị chua, cay.\n2. Lẩu Cù Lao: Lẩu cù lao là món lẩu truyền thống với nồi lẩu dạng tháp độc đáo, nước dùng ngọt thanh từ xương hầm.\n3. Cá tai tượng chiên xù: Cá tai tượng chiên xù là món ăn hấp dẫn với cá chiên vàng giòn nguyên con, lớp da phồng rụm, thịt bê.\n4. Cà nướng Tây Bắc: Cà nướng Tây Bắc là món ăn đơn giản nhưng đầy hương vị, với cà nướng trên than hồng, ăn kèm với muối vừng.\n5. Tôm sú sốt mật ong: Tôm sú sốt mật ong là món ăn ngọt ngào, với tôm sú tươi ngon được sốt với mật ong và các gia vị khác.\n\nEm hy vọng những gợi ý này sẽ giúp chị Linh có thêm ý tưởng cho menu của nhà hàng ạ.','2026-04-27 10:17:17'),(69,3,'admin_session_1777257259321_6pjt3w4vy','user','tạo món ăn cho chị 5 món','2026-04-27 10:17:36'),(70,3,'admin_session_1777257259321_6pjt3w4vy','user','hi','2026-04-27 10:18:55'),(71,3,'admin_session_1777257259321_6pjt3w4vy','bot','Chị Linh ơi, em đã xem xét dữ liệu trong cơ sở dữ liệu và thấy rằng có một số món ăn hấp dẫn trong menu của nhà hàng \"Ẩm Thực Phương Nam\". \n\nMột số món ăn có giá trị cao và được bán với số lượng lớn, chẳng hạn như \"Khai vị 4 mùa\" và \"Lẩu Cù Lao\". Những món ăn này có thể là những lựa chọn phổ biến cho khách hàng và có thể mang lại lợi nhuận cao cho nhà hàng.\n\nTuy nhiên, cũng có một số món ăn có giá thấp hơn và được bán với số lượng ít hơn, chẳng hạn như \"Cà nướng Tây Bắc\". Những món ăn này có thể là những lựa chọn tốt cho khách hàng muốn thử những món ăn mới và có thể mang lại lợi nhuận thấp hơn cho nhà hàng.\n\nEm đề xuất chị Linh nên xem xét lại menu và giá cả của nhà hàng để tối ưu hóa lợi nhuận. Chị Linh có thể xem xét việc tăng giá của những món ăn phổ biến và giảm giá của những món ăn ít phổ biến hơn. Ngoài ra, chị Linh cũng có thể xem xét việc thêm những món ăn mới vào menu để thu hút khách hàng và tăng doanh thu cho nhà hàng.','2026-04-27 10:18:58'),(72,3,'admin_session_1777257259321_6pjt3w4vy','user','tạo cho chị 5 món ăn mới','2026-04-27 10:19:10'),(73,3,'admin_session_1777257259321_6pjt3w4vy','bot','? **Xin chào! Tôi là trợ lý AI của bạn.**\n\nTôi có thể giúp bạn:\n? Xem báo cáo tổng quan\n? Phân tích doanh thu\n? Đặt và theo dõi mục tiêu\n? Đề xuất chiến lược kinh doanh\n?️ Phân tích món ăn bán chạy\n\nHãy hỏi tôi bất cứ điều gì!','2026-04-27 10:19:41'),(74,3,'admin_session_1777257259321_6pjt3w4vy','user','Doanh thu tháng này','2026-04-27 10:20:01'),(75,3,'admin_session_1777257259321_6pjt3w4vy','bot','? **PHÂN TÍCH DOANH THU**\n\nTháng này: 0đ\nTháng trước: 1.575.000đ\nThay đổi: -100%\n\n? **Nhận xét:** ? Doanh thu giảm đáng kể. Cần có chiến lược cải thiện ngay!','2026-04-27 10:20:32'),(76,3,'admin_session_1777257259321_6pjt3w4vy','user','hi','2026-04-27 10:27:00'),(77,3,'admin_session_1777257259321_6pjt3w4vy','bot','Chị Linh ơi, em đã xem xét dữ liệu trong cơ sở dữ liệu và thấy rằng có một số món ăn hấp dẫn như \"Khai vị 4 mùa\", \"Lẩu Cù Lao\", \"Cá tai tượng chiên xù\" và \"Tôm sú sốt mật ong\". Những món ăn này có giá từ 200.000 đồng đến 400.000 đồng và có nhiều đánh giá tích cực từ khách hàng.\n\nEm đề xuất chị Linh nên tập trung vào việc quảng cáo và推广 những món ăn này để thu hút khách hàng mới và tăng doanh thu cho nhà hàng. Ngoài ra, em cũng thấy rằng có một số món ăn có giá cả phải chăng như \"Cà nướng Tây Bắc\" với giá 40.000 đồng, em đề xuất chị Linh nên xem xét việc giảm giá hoặc tạo chương trình khuyến mãi cho món ăn này để thu hút khách hàng.\n\nVề chiến lược, em đề xuất chị Linh nên tập trung vào việc tạo ra một môi trường ẩm thực phong phú và đa dạng, với nhiều lựa chọn cho khách hàng. Em cũng đề xuất chị Linh nên đầu tư vào việc quảng cáo và tiếp thị để tăng cường nhận thức về thương hiệu và thu hút khách hàng mới.\n\nVề sản phẩm mới, em đề xuất chị Linh nên xem xét việc tạo ra một số món ăn mới với nguyên liệu địa phương và hương vị độc đáo, như món ăn từ vùng Tây Bắc hoặc món ăn từ vùng biển. Điều này sẽ giúp nhà hàng tạo ra một điểm khác biệt và thu hút khách hàng mới.\n\nVề tối ưu hóa lợi nhuận, em đề xuất chị Linh nên xem xét việc giảm chi phí nguyên liệu và nhân công, cũng như tăng cường hiệu suất phục vụ để giảm thiểu thời gian chờ đợi và tăng cường trải nghiệm khách hàng. Em cũng đề xuất chị Linh nên xem xét việc tạo ra một số chương trình khuyến mãi và giảm giá để thu hút khách hàng mới và tăng doanh thu.','2026-04-27 10:27:09'),(78,NULL,'session_1777774094061_x8xrh1h0s','user','Gợi ý món ăn cho tôi','2026-05-03 09:08:18'),(79,NULL,'session_1777774094061_x8xrh1h0s','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam ?. Tôi có thể gợi ý cho anh/chị một số món ăn ngon:\n\n1. **Khai vị 4 mùa**: 200.000d/suất (Khai vị) - Một lựa chọn tuyệt vời để bắt đầu bữa ăn ?\n2. **Cà nướng Tây Bắc**: 40.000d/phần (Món chính) - Món cà nướng Tây Bắc thơm ngon, giòn rụm, không thể bỏ lỡ! ?\n3. **Lẩu Cù Lao**: 200.000d/suất (Món chính) - Món lẩu Cù Lao nóng hổi, thơm ngon, thích hợp cho những ngày trời lạnh ✨\n\nAnh/chị muốn biết thêm thông tin về các món ăn này không? ?','2026-05-03 09:08:30'),(80,NULL,'session_1777774094061_x8xrh1h0s','user','ở đây có món gà không','2026-05-03 09:08:46'),(81,NULL,'session_1777774094061_x8xrh1h0s','bot','Em là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Em có món gà hấp mắm nhĩ với giá 300.000đ/suất, và sụn gà chiên nước mắm với giá 89.000đ/suất. Bạn có muốn thêm món gà vào giỏ hàng không? ?','2026-05-03 09:08:47'),(82,3,'session_1779070437524_942g4lvvi','user','món cá tai tượng không ngon,','2026-05-18 10:26:52'),(83,3,'session_1779070437524_942g4lvvi','user','l','2026-05-18 10:29:01'),(84,3,'session_1779070437524_942g4lvvi','user','alo','2026-05-18 10:33:20'),(85,NULL,'guest_1779075475114','user','giờ mở cửa','2026-05-18 10:37:55'),(86,3,'session_1779075561907_pkbecdij6','user','Món bán chạy nhất','2026-05-18 10:39:23'),(87,NULL,'guest_1779075601608','user','giờ mở cửa','2026-05-18 10:40:01'),(88,3,'session_1779075847939_6jxbgxor4','user','Giờ mở cửa','2026-05-18 10:44:08'),(89,NULL,'guest_1779075871958','user','giờ mở cửa','2026-05-18 10:44:31'),(90,3,'session_1779075847939_6jxbgxor4','user','hi','2026-05-18 10:48:48'),(91,3,'session_1779075847939_6jxbgxor4','bot','Chào anh/chị! Em là Trà My, trật lý ác ý cá nhân Nhà Hàng Phương Nam. ?','2026-05-18 10:48:49'),(92,3,'session_1779075847939_6jxbgxor4','user','ở đây có món cà nướng không','2026-05-18 11:11:44'),(93,3,'session_1779075847939_6jxbgxor4','bot','Có, ở đây có món cà nướng Tây Bắc với giá 40.000đ/phần.','2026-05-18 11:11:45'),(94,3,'session_1779075847939_6jxbgxor4','user','tôi muốn ăn món gì đó mát trong thời tiết nắng nóng','2026-05-18 11:12:25'),(95,3,'session_1779075847939_6jxbgxor4','bot','Em có thể gợi ý cho bạn một số món ăn mát mà chúng tôi có tại Nhà Hàng Phương Nam:\n\n1. **Cà nướng Tây Bắc**: Đây là một món ăn đặc trưng của vùng Tây Bắc, được nướng trên than hồng và có vị ngọt mát của cà.\n2. **Tôm nướng muối**: Món ăn này được nướng trên than hồng và có vị mặn của muối, giúp làm mát và giảm nhiệt độ cơ thể.\n3. **Gỏi bò bóp thấu**: Món ăn này được làm từ bò bóp thấu và các loại rau củ tươi, giúp làm mát và cung cấp nước cho cơ thể.\n4. **Cơm chiên tỏi trứng**: Món ăn này được chiên với tỏi và trứng, giúp tạo ra một hương vị thơm ngon và mát.\n5. **Trứng chiên hành**: Món ăn này được chiên với hành và có vị thơm ngon, giúp làm mát và giảm nhiệt độ cơ thể.\n\nHãy cho em biết bạn muốn ăn món gì và em sẽ giúp bạn đặt hàng!','2026-05-18 11:12:25'),(96,3,'session_1779414297864_pv8p1lgal','user','hi\\','2026-05-22 10:13:21'),(97,3,'session_1779414297864_pv8p1lgal','bot','Chào anh/chị! Em là Trà My, trợ lý áo đỡ thương của Nhà Hàng Phương Nam. Em sẵn sàng giúp anh/chị với mọi câu hỏi hoặc cần hỗ trợ gì nữa nhé!','2026-05-22 10:13:23'),(98,3,'session_1779414297864_pv8p1lgal','user','nhà hàng gì có món gì bán chạy','2026-05-22 10:13:43'),(99,3,'session_1779414297864_pv8p1lgal','bot','Theo danh sách trên, Nhà hàng Phương Nam có các món bán chạy sau:\n\n1. **Khai vị 4 mùa**: 200.000d/suất (Khai vị) *5.0\n2. **Lẩu Cù Lao**: 200.000d/suất (Món chính)\n3. **Cá tai tượng chiên xù**: 250.000d/suất (Món chính)\n4. **Tôm sú sốt mật ong**: 100.000d/suất (Khai vị)\n5. **Cà nướng Tây Bắc**: 40.000d/phần (Món chính)\n\nNhững món này được nhiều người chọn lựa và là điểm mạnh của Nhà hàng Phương Nam. Tuy nhiên, để biết thông tin chính xác về món bán chạy nhất, bạn nên liên hệ trực tiếp với nhà hàng hoặc tham khảo đánh giá từ khách hàng đã từng đến nhà hàng.','2026-05-22 10:13:44'),(100,3,'session_1779414297864_pv8p1lgal','user','gia định tôi đi 5 người gọi bao nhiêu món đủ ăn','2026-05-22 10:14:07'),(101,3,'session_1779414297864_pv8p1lgal','bot','Để giúp bạn đặt hàng, tôi sẽ đề xuất một số món ăn phù hợp cho 5 người.\n\nTrước hết, tôi sẽ đề xuất 2-3 món chính để đảm bảo đủ ăn cho cả nhóm.\n\n1. Bò né: 200.000d/suất (5 suất = 1.000.000d)\n2. Gỏi bò Phương Nam: 250.000d/suất (5 suất = 1.250.000d)\n3. Cà nướng Tây Bắc: 40.000d/phần (5 phần = 200.000d)\n\nTổng giá trị của 3 món chính là: 1.000.000d + 1.250.000d + 200.000d = 2.450.000d\n\nĐể thêm một món khai vị, tôi sẽ đề xuất:\n\n1. Khai vị 4 mùa: 200.000d/suất (5 suất = 1.000.000d)\n\nTổng giá trị của cả bộ menu là: 2.450.000d + 1.000.000d = 3.450.000d\n\nNếu bạn muốn thêm một món ăn khác hoặc thay đổi món nào đó, vui lòng cho tôi biết.\n\nTôi hy vọng đề xuất này sẽ giúp bạn đặt hàng cho 5 người.','2026-05-22 10:14:08'),(102,3,'session_1779414297864_pv8p1lgal','user','1 phần như vậy bao nhiêu người ăn mà kêu nhiều vậy','2026-05-22 10:14:49'),(103,3,'session_1779414297864_pv8p1lgal','bot','Theo tôi, 1 phần như vậy có thể phục vụ cho 1-2 người ăn, tùy thuộc vào mức độ ăn uống của mỗi người. Nếu như 1 người ăn nhiều thì 1 phần có thể đủ, nhưng nếu như 2 người ăn vừa phải thì có thể cần 2 phần.','2026-05-22 10:14:49'),(104,3,'session_1779414297864_pv8p1lgal','user','chủ nhà hàng tên gì','2026-05-22 10:16:05'),(105,3,'session_1779414297864_pv8p1lgal','bot','Chủ nhà hàng tên là Trà My.','2026-05-22 10:16:05'),(106,3,'session_1779424297137_xtl393awi','user','chủ nhà hàng tên gì nhỉ','2026-05-22 11:31:50'),(107,3,'session_1779424297137_xtl393awi','bot','Chị Hoàng Thục Linh là chủ nhà hàng Ẩm thực Phương Nam, chị có 10 năm kinh nghiệm quản lý và phát triển ẩm thực. ?','2026-05-22 11:31:51'),(108,NULL,'session_1779501342475_sr4si9345','user','Gợi ý món ăn cho tôi','2026-05-23 11:18:33'),(109,NULL,'session_1779501342475_sr4si9345','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nAnh chị muốn thử món gì hôm nay? Nhà hàng có nhiều món ăn ngon, đặc sản miền Tây Nam Bộ. Em có thể gợi ý:\n\n- Khai vị 4 mùa: 200.000d/suất (Khai vị)\n- Lẩu Cù Lao: 200.000d/suất (Món chính)\n- Cà nướng Tây Bắc: 35.000d/phần (Món chính)\n\nEm có thể giúp anh chị chọn món ăn phù hợp, ạ? ?','2026-05-23 11:18:34'),(110,NULL,'session_1779501342475_sr4si9345','user','cho hỏi chủ tên gì','2026-05-23 11:23:52'),(111,NULL,'session_1779501342475_sr4si9345','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ? ?\n\nChủ nhà hàng Phương Nam tên là chị Hoàng Thục Linh, một người sáng lập và chủ nhà hàng có 10 năm kinh nghiệm trong lĩnh vực ẩm thực. ?','2026-05-23 11:23:53'),(112,NULL,'session_1779501342475_sr4si9345','user','chủ nhà hg ten gi','2026-05-23 11:27:07'),(113,NULL,'session_1779501342475_sr4si9345','bot','Chị Hoàng Thục Linh là chủ nhà hàng Phương Nam, em nhé! ??','2026-05-23 11:27:07'),(114,NULL,'session_1779501342475_sr4si9345','user','o day co lau cu lao ko','2026-05-23 11:27:19'),(115,NULL,'session_1779501342475_sr4si9345','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? Lẩu Cù Lao của Nhà Hàng Phương Nam có giá 200.000đ/suất, món ăn này được chế biến từ các nguyên liệu tươi sống và có hương vị đặc trưng của vùng Cù Lao.','2026-05-23 11:27:20'),(116,NULL,'session_1779768026190_ml1wb0l5u','user','o day co banh bo k','2026-05-26 11:00:46'),(117,NULL,'session_1779768026190_ml1wb0l5u','bot','Em xin lỗi anh/chị, nhưng không thấy món bánh bò trong danh sách của Nhà Hàng Phương Nam. Nếu anh/chị muốn biết thông tin về món bánh bò hoặc đặt món khác, em sẵn sàng giúp đỡ! ?','2026-05-26 11:00:47'),(118,NULL,'session_1779768026190_ml1wb0l5u','user','dau bep ten j','2026-05-26 11:01:32'),(119,NULL,'session_1779768026190_ml1wb0l5u','bot','Chào anh J! ?\n\nEm là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nAnh chị muốn gọi món gì trong Nhà Hàng Phương Nam? ?','2026-05-26 11:01:33'),(120,NULL,'session_1779768026190_ml1wb0l5u','user','chu nha hang ten j','2026-05-26 11:01:45'),(121,NULL,'session_1779768026190_ml1wb0l5u','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?','2026-05-26 11:01:46'),(122,NULL,'session_1779768026190_ml1wb0l5u','user','chu nha hang ten gi','2026-05-26 11:01:53'),(123,NULL,'session_1779768026190_ml1wb0l5u','bot','Chào anh chị ạ! Em là Trà My ?. Nhà hàng Phương Nam được thành lập bởi ông Nguyễn Huỳnh Kính Tường.','2026-05-26 11:01:54'),(124,NULL,'session_1779768147268_8vco6siu9','user','chủ nhà hg ten gich','2026-05-26 11:02:41'),(125,NULL,'session_1779768147268_8vco6siu9','bot','Em xin lỗi, nhưng em không tìm thấy thông tin về chủ nhà hàng tên là \"Gich\". Nhà hàng Phương Nam được sáng lập bởi chị Hoàng Thục Linh. ?','2026-05-26 11:02:42'),(126,NULL,'session_1779768147268_8vco6siu9','user','o day co nuoc sam k','2026-05-26 11:02:54'),(127,NULL,'session_1779768147268_8vco6siu9','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ? ?\n\nEm có nước mắm và sốt mật ong, nhưng không có nước sam. Nếu anh chị muốn biết thêm thông tin về nước mắm hoặc sốt mật ong, em sẵn sàng giúp đỡ! ?','2026-05-26 11:02:55'),(128,NULL,'session_1779768231522_x2in28z88','user','chủ nhà hg ten gi','2026-05-26 11:03:54'),(129,NULL,'session_1779768231522_x2in28z88','bot','Chị Hoàng Thục Linh là chủ nhà hàng Phương Nam, em ạ! ?','2026-05-26 11:03:54'),(130,NULL,'session_1779768231522_x2in28z88','user','dau bep ten j','2026-05-26 11:04:07'),(131,NULL,'session_1779768231522_x2in28z88','bot','Chào anh J! ? ?\n\nEm là Trà My, em có thể giúp gì cho anh J ạ? Bạn muốn biết thông tin về menu của Nhà Hàng Phương Nam không? ?','2026-05-26 11:04:07'),(132,NULL,'session_1779768231522_x2in28z88','user','đầu bếp tên j','2026-05-26 11:04:16'),(133,NULL,'session_1779768231522_x2in28z88','bot','Chào anh chị ạ! ? Em là Trà My, em có thể giúp gì cho anh chị ạ? Anh chị có muốn biết thông tin về nhà hàng hay là đặt món ăn nào? ? ?','2026-05-26 11:04:16'),(134,NULL,'session_1779768231522_x2in28z88','user','bếp trường tên j','2026-05-26 11:06:09'),(135,NULL,'session_1779768231522_x2in28z88','bot',' Anh/chị ơi! Em là Trà My, em có thể giúp gì cho anh chị ạ?','2026-05-26 11:06:09'),(136,NULL,'session_1779768231522_x2in28z88','user','bếp trưởng tên gì','2026-05-26 11:06:15'),(137,NULL,'session_1779768231522_x2in28z88','bot','Anh là Trà My, bếp trưởng tên là anh Nguyễn Nhật Trường ạ. ?','2026-05-26 11:06:16'),(138,NULL,'session_1779768231522_x2in28z88','user','cc','2026-05-26 11:08:09'),(139,NULL,'session_1779768231522_x2in28z88','bot','Chào anh/chị ?! Em là Trà My, em có thể giúp gì cho anh chị ạ? Em sẵn sàng hỗ trợ anh chị đặt món ăn ngon tại Nhà Hàng Phương Nam ?.','2026-05-26 11:08:10'),(140,NULL,'session_1779768231522_x2in28z88','user','đụ má','2026-05-26 11:08:16'),(141,NULL,'session_1779768231522_x2in28z88','bot','Tôi xin lỗi vì đã không đáp ứng được yêu cầu của anh chị. Em là Trà My, em có thể giúp gì cho anh chị ạ? ? ?','2026-05-26 11:08:17'),(142,3,'session_1780888495325_23mrlxwdw','user','ở đây có cà nướng không','2026-06-08 11:26:18'),(143,3,'session_1780888495325_23mrlxwdw','bot','Chị ơi, em có cà nướng Tây Bắc ?. Món cà nướng Tây Bắc của chúng em được nướng trên than hồng, có hương vị thơm ngon và đậm đà. Giá của món cà nướng Tây Bắc là 35.000đ/phần ?.','2026-06-08 11:26:19'),(144,NULL,'session_1781657159397_qg96kr24o','user','o day co mon lau cu lao k','2026-06-17 07:46:09'),(145,NULL,'session_1781657159397_qg96kr24o','bot','? Chị ơi, em có thể giúp gì cho anh chị ạ? ?\n\nLẩu Cù Lao của chúng tôi có giá 200.000đ/suất. Bạn muốn biết thêm thông tin hay đặt món? ?','2026-06-17 07:46:10'),(146,NULL,'session_1781657159397_qg96kr24o','user','toi can tu van mon hai san','2026-06-17 07:46:28'),(147,NULL,'session_1781657159397_qg96kr24o','bot','Chị ơi! Em là Trà My, em có thể giúp gì cho chị ạ? ?\n\nChị muốn đặt món gì không? Em có thể giúp chị đặt món \"Khô lù đù 1 nắng\" với giá 99.000đ/phần. Chị muốn đặt số lượng nào? ?','2026-06-17 07:46:29'),(148,NULL,'session_1781657159397_qg96kr24o','user','o day co mon nao thanh dam','2026-06-17 07:46:55'),(149,NULL,'session_1781657159397_qg96kr24o','bot','Em có thể giúp anh chị tìm được món ăn thanh đạm. ?\n\nAnh/chị có thể tham khảo các món sau:\n\n- Sụn gà chiên nước mắm: 89.000d/suất\n- Mực trứng chiên nước mắm: 199.000d/suất\n- Cơm chiên tỏi trứng: 99.000d/suất\n- Trứng chiên hành: 55.000d/suất\n\nHy vọng anh chị sẽ thích một trong những món ăn này! ?','2026-06-17 07:46:56'),(150,NULL,'test_session_123','user','tìm món ăn thanh đạm','2026-06-17 07:51:10'),(151,NULL,'test_session_123','bot','Em có thể giúp anh chị tìm món ăn thanh đạm ?. Nhà hàng Phương Nam có nhiều lựa chọn cho anh chị. Một số món ăn thanh đạm được yêu thích bao gồm:\n\n- Cà nướng Tây Bắc (35.000đ/phần): Món này được chế biến từ cà tươi, nướng trên than hồng mang đến hương vị thanh đạm và thơm ngon.\n- Tôm xào bông mướp (150.000đ/suất): Món này được chế biến từ tôm tươi, bông mướp và các nguyên liệu khác, mang đến hương vị thanh đạm và thanh nhẹ.\n\nHy vọng anh chị sẽ tìm được món ăn phù hợp! ?','2026-06-17 07:51:11'),(152,NULL,'session_1781657159397_qg96kr24o','user','ơ day co mon thanh dam k','2026-06-17 07:53:28'),(153,NULL,'session_1781657159397_qg96kr24o','bot','Em có thể giúp anh chị tìm món ăn thanh đạm không? \n\nMón ăn thanh đạm mà em đề xuất là:\n\n- Tôm xào bông mướp: 150.000d/suất\n- Khai vị 4 mùa: 200.000d/suất (Khai vị) *5.0\n\nLiên hệ với em để biết thêm thông tin và đặt món nhé! ? ?','2026-06-17 07:53:29'),(154,NULL,'session_1781657159397_qg96kr24o','user','ơ day co mon thanh dam k','2026-06-17 07:55:01'),(155,NULL,'session_1781657159397_qg96kr24o','bot','Em biết anh/chị đang tìm món thanh đạm để thưởng thức. Nhà hàng Phương Nam có nhiều lựa chọn ngon và bổ dưỡng. Anh/chị có thể tham khảo:\n\n- Gỏi cuốn tôm thịt: 120.000d/suất (Món chính)\n- Cơm rang trứng muối: 180.000d/suất (Món chính)\n- Đậu hũ kho gừng: 150.000d/suất (Món chính)\n\nEm có thể giúp anh/chị đặt món không? ?','2026-06-17 07:55:02'),(156,NULL,'session_1781657159397_qg96kr24o','user','o day có canh cua rau dai khong\'','2026-06-17 07:55:22'),(157,NULL,'session_1781657159397_qg96kr24o','bot','Em có thể giúp anh chị tìm món ăn đó! ?\n\nMón Canh cua rau đay có giá 180.000đ/suất (Món chính). Bạn muốn đặt món này không ạ? ?','2026-06-17 07:55:23'),(158,NULL,'test_session_hallucination_123','user','tôi muốn đặt canh cua rau đay','2026-06-17 07:57:26'),(159,NULL,'test_session_hallucination_123','bot','Em xin lỗi anh chị, nhưng nhà hàng hiện chưa có món canh cua rau đay trong thực đơn. Em có thể giúp anh chị xem các món ăn khác trong thực đơn? ?','2026-06-17 07:57:27'),(160,NULL,'session_1781657159397_qg96kr24o','user','o day có canh cua rau dai khong\'','2026-06-17 07:58:53'),(161,NULL,'session_1781657159397_qg96kr24o','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nVề món canh cua rau dại, em xin lỗi anh chị vì nhà hàng Phương Nam hiện chưa có món này trong danh sách thực đơn. Em có thể giúp anh chị đặt món khác không? ?','2026-06-17 07:58:54'),(162,NULL,'session_1781657159397_qg96kr24o','user','o day co bun bo k','2026-06-17 07:59:09'),(163,NULL,'session_1781657159397_qg96kr24o','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nBún bò Khoái là một món ăn ngon, nhưng nhà hàng Phương Nam hiện chưa có món này trong danh sách thực đơn. ?','2026-06-17 07:59:10'),(164,NULL,'session_1781657159397_qg96kr24o','user','Xem thực đơn','2026-06-17 08:13:22'),(165,NULL,'session_1781657159397_qg96kr24o','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nEm có thể giúp anh chị xem thực đơn của Nhà Hàng Phương Nam. Anh chị có thể chọn từ các món ăn sau:\n\n- **Món Nước**:\n + Cà phê: 15.000đ\n + Trà sữa: 20.000đ\n + Bia: 40.000đ\n- **Món Ăn Ngon**:\n + Phở bò: 70.000đ\n + Cơm tấm: 60.000đ\n + Bún riêu: 55.000đ\n + Gỏi cuốn: 40.000đ\n- **Món Tráng Miệng**:\n + Rau củ xào: 20.000đ\n + Salad rau củ: 25.000đ\n\nAnh chị muốn xem thêm thông tin nào về thực đơn? ?','2026-06-17 08:13:23'),(166,NULL,'session_1781657159397_qg96kr24o','user','Đặt bàn','2026-06-17 08:14:27'),(167,NULL,'session_1781657159397_qg96kr24o','bot','Chào anh chị ạ! Em là Trà My, em có thể giúp gì cho anh chị ạ? Anh chị muốn đặt bàn cho bữa ăn nào? ?','2026-06-17 08:14:28'),(168,NULL,'session_1781657159397_qg96kr24o','user','Xem thực đơn','2026-06-17 08:22:04'),(169,NULL,'session_1781657159397_qg96kr24o','bot','Em có thể giúp anh chị xem thực đơn của Nhà Hàng Phương Nam nhé! ?\n\nDưới đây là một số món ăn được yêu thích:\n\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n- Lẩu Cù Lao: 200.000d/suất (Món chính)\n- Sụn gà chiên nước mắm: 89.000d/suất (Món chính)\n- Đồ nguội mâm tiệc: 299.000d/suất (Khai vị)\n- Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n- Khai vị 4 mùa: 200.000d/suất (Khai vị)\n- Khô lù đù 1 nắng: 99.000d/suất (Món Chính)\n\nEm có thể giúp anh chị thêm món vào giỏ hàng nếu muốn nhé! ?','2026-06-17 08:22:05'),(170,NULL,'session_1781657159397_qg96kr24o','user','hi','2026-06-17 08:28:36'),(171,NULL,'session_1781657159397_qg96kr24o','bot','Chào anh/chị ạ! ? ?\nEm là Trà My, em có thể giúp gì cho anh chị ạ?','2026-06-17 08:28:38'),(172,NULL,'session_1781657159397_qg96kr24o','user','ơ day co lau thai k','2026-06-17 08:30:37'),(173,NULL,'session_1781657159397_qg96kr24o','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nEm có thể giúp anh chị đặt hàng, xem giỏ hàng, hoặc thêm món vào giỏ hàng. Nếu anh chị muốn đặt món, chỉ cần nói: \"đặt 2 phần phở bò, 1 cơm tấm\" ?\n\nNếu anh chị cần biết thêm thông tin về các món ăn, em có thể giúp đỡ. Hãy cho em biết anh chị muốn biết gì! ?','2026-06-17 08:30:37'),(174,NULL,'session_1781657159397_qg96kr24o','user','toi muon an lau thai','2026-06-17 08:30:49'),(175,NULL,'session_1781657159397_qg96kr24o','bot','Anh chị muốn ăn Lẩu Thác Lác Khổ Qua ?\n\nGiá của món ăn này là 350.000đ/suất. Anh chị muốn đặt số lượng nào? ?','2026-06-17 08:30:50'),(176,NULL,'session_1781657159397_qg96kr24o','user','lẩu thái','2026-06-17 08:30:55'),(177,NULL,'session_1781657159397_qg96kr24o','bot','Chào anh chị ạ! ?\n\nLẩu Thái là một lựa chọn tuyệt vời! ?\n\nGiá của Lẩu Thái tại Nhà Hàng Phương Nam là 250.000 đồng/suất. ?\n\nChị muốn đặt Lẩu Thái hay chỉ cần thêm vào giỏ hàng không ạ? ?','2026-06-17 08:30:56'),(178,NULL,'test_session_1781660088622','user','Có lẩu thái không?','2026-06-17 08:34:48'),(179,NULL,'test_session_1781660088622','bot','Chị ạ, em xin lỗi vì em không thấy món lẩu Thái trong danh sách món ăn của nhà hàng Phương Nam. Em có thể gợi ý cho chị một số món lẩu khác như Lẩu Cù Lao hoặc Lẩu thác lác khổ qua, có rất ngon và hấp dẫn. ??','2026-06-17 08:34:50'),(180,NULL,'session_1781657159397_qg96kr24o','user','o day co bun cha k','2026-06-17 08:36:05'),(181,NULL,'session_1781657159397_qg96kr24o','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nEm xin lỗi, nhưng nhà hàng hiện tại không phục vụ món \"bun cha\". Nếu anh chị muốn đặt món thì có thể tham khảo các món chính như: Bò né 200.000d/suất, Cà nướng Tây Bắc 40.000d/phần... hoặc các món khai vị như: Đồ nguội mâm tiệc 299.000d/suất... Cho em biết anh chị muốn đặt món gì nhé? ?✨','2026-06-17 08:36:06'),(182,NULL,'session_1781660188813_65ucs9e10','user','ghi','2026-06-17 08:38:44'),(183,NULL,'session_1781660188813_65ucs9e10','bot','Chào anh chị ạ! ?\n\nEm là Trà My, trợ lý ảo của Nhà Hàng Phương Nam. Em có thể giúp gì cho anh chị ạ? ?','2026-06-17 08:38:44'),(184,NULL,'session_1781660188813_65ucs9e10','user','tôi can tu van dat ban','2026-06-17 08:39:13'),(185,NULL,'session_1781660188813_65ucs9e10','bot','Chào anh chị! ? Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nAnh chị đang muốn đặt món gì cho bữa ăn? Em có nhiều món ngon để anh chị lựa chọn. Dưới đây là một số gợi ý:\n\n- Cá tai tượng chiên xù: 250.000d/suất (Món chính)\n- Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n- Khô lù đù 1 nắng: 99.000d/suất (Món Chính)\n- Tôm nướng muối : 150.000d/suất (Món chính)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n\nEm hy vọng anh chị sẽ chọn được món ăn ưng ý! ?','2026-06-17 08:39:14'),(186,NULL,'session_1781660188813_65ucs9e10','user','toi di 5 nguoi, co tre em, can goi bao nhiu mon la du','2026-06-17 08:39:40'),(187,NULL,'session_1781660188813_65ucs9e10','bot','Chào anh chị, em là Trà My. ?\n\nNhà hàng Phương Nam hiện tại KHÔNG CÓ và KHÔNG PHỤC VỤ các món \"toi di nguoi\" và \"co tre em\". ?\n\nNếu anh chị muốn đặt món, em có thể gợi ý một số món hấp dẫn khác như:\n\n- Cá tai tượng chiên xù: 250.000d/suất (Món chính)\n- Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n- Khô lù đù 1 nắng: 99.000d/suất (Món Chính)\n- Tôm nướng muối : 150.000d/suất (Món chính)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n\nEm mong anh chị sẽ chọn được món yêu thích! ?','2026-06-17 08:39:41'),(188,NULL,'session_1781660188813_65ucs9e10','user','khong phai toi dang can tu van so luong nguoi dạt','2026-06-17 08:40:02'),(189,NULL,'session_1781660188813_65ucs9e10','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nVì món \"người dạt\" không có trong thực đơn của Nhà Hàng Phương Nam, nên anh chị có thể tham khảo một số món ngon khác của chúng tôi:\n\n- Cá tai tượng chiên xù: 250.000d/suất (Món chính)\n- Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n- Khô lù đù 1 nắng: 99.000d/suất (Món Chính)\n- Tôm nướng muối : 150.000d/suất (Món chính)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n\nAnh chị muốn đặt món gì khác? ?','2026-06-17 08:40:03'),(190,NULL,'session_1781660188813_65ucs9e10','user','lau cu lao la mon chay hay manj','2026-06-17 08:40:34'),(191,NULL,'session_1781660188813_65ucs9e10','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nEm xin lỗi, nhưng nhà hàng Phương Nam hiện tại không phục vụ các món lau cu lao la hoặc món chay manj. Nếu anh chị muốn biết thêm các món ăn khác, em có thể gợi ý một số món ngon như:\n\n * Sụn gà chiên nước mắm: 89.000d/suất (Món chính)\n * Cơm chiên tỏi trứng: 99.000d/suất (Món chính)\n * Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n\nHãy cho em biết nếu anh chị muốn biết thêm thông tin nào khác! ?','2026-06-17 08:40:35'),(192,NULL,'session_1781660188813_65ucs9e10','user','lẩu cù lao là món chay hay món mặn\'','2026-06-17 08:40:55'),(193,NULL,'session_1781660188813_65ucs9e10','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ? ?\n\nLẩu Cù Lao của Nhà Hàng Phương Nam là món mặn, sử dụng nguyên liệu từ hải sản và các loại gia vị đặc trưng. ?\n\nGiá của món Lẩu Cù Lao là 200.000đ/suất. Anh chị muốn biết thêm thông tin hoặc đặt món không ạ? ?','2026-06-17 08:40:55'),(194,NULL,'session_1781660188813_65ucs9e10','user','trời nóng quá, rôi can ăn mon gi thanh dạm','2026-06-17 08:41:27'),(195,NULL,'session_1781660188813_65ucs9e10','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nEm thấy anh chị muốn ăn món gì mát mẻ và dễ chịu. Nhà hàng chúng em có một số món ăn đặc sắc mà anh chị có thể tham khảo như:\n\n * Khô lù đù 1 nắng: 99.000d/suất (Món Chính)\n * Cà nướng Tây Bắc: 35.000d/phần (Món chính)\n * Tôm nướng muối : 150.000d/suất (Món chính)\n\n Hy vọng anh chị sẽ tìm được món ăn ưng ý!','2026-06-17 08:41:27'),(196,NULL,'session_1781660188813_65ucs9e10','user','chu nha hang ten j','2026-06-17 08:42:38'),(197,NULL,'session_1781660188813_65ucs9e10','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nEm xin lỗi, nhưng nhà hàng hiện tại không có món \"chu nha hang ten\". Em có thể gợi ý cho anh chị một số món khác trong thực đơn của nhà hàng Phương Nam, như:\n\n- Bò né: 200.000d/suất\n- Cà nướng Tây Bắc: 40.000d/phần\n- Cá tai tượng chiên xù: 250.000d/suất\n- Cơm chiên tỏi trứng: 99.000d/suất\n- Gà hấp mắm nhĩ: 300.000d/suất\n\nAnh chị có muốn biết thêm thông tin về các món này không?','2026-06-17 08:42:38'),(198,NULL,'test_session_1781660686551','user','chu nha hang ten gi','2026-06-17 08:44:46'),(199,NULL,'test_session_1781660686551','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nNhà hàng của em tên là \"Phương Nam – Ngon như mẹ nấu\". Em hy vọng anh chị sẽ có một bữa ăn tuyệt vời tại đây! ?','2026-06-17 08:44:47'),(200,NULL,'test_session_1781660730825','user','chu nha hang ten gi','2026-06-17 08:45:30'),(201,NULL,'test_session_1781660730825','bot','Chào anh chị ạ! Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nNhà hàng của chúng em tên là \"PHƯƠNG NAM – NGON NHƯ MẸ NẤU\". ?\n\nNếu anh chị cần biết thêm thông tin, vui lòng cho em biết ạ! ?','2026-06-17 08:45:31'),(202,NULL,'test_session_1781660823095','user','chu nha hang ten gi','2026-06-17 08:47:03'),(203,NULL,'test_session_1781660823095','bot','? Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nChủ nhà hàng của em là chị Hoàng Thục Linh, chị là người sáng lập và quản lý nhà hàng nhiều năm rồi, chị luôn mong muốn mang đến cho thực khách những món ăn ngon, sạch, mang đậm hương vị truyền thống quê hương. ?','2026-06-17 08:47:03'),(204,NULL,'session_1781660188813_65ucs9e10','user','bep truong ten gi','2026-06-17 08:50:14'),(205,NULL,'session_1781660188813_65ucs9e10','bot','Chào anh chị ạ! ?\n\nBếp trưởng của Nhà Hàng Phương Nam là anh Nguyễn Nhật Trường. Anh ấy có hơn 20 năm kinh nghiệm trong nghề bếp. Anh luôn cố gắng mang đến những món ăn ngon và hấp dẫn cho khách hàng. ?','2026-06-17 08:50:14'),(206,NULL,'session_1781660188813_65ucs9e10','user','ok e','2026-06-17 08:50:23'),(207,NULL,'session_1781660188813_65ucs9e10','bot','Chào anh chị ạ! ?\n\nEm là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nEm sẵn sàng hỗ trợ anh chị đặt món, xem giỏ hàng, đặt hàng, hoặc bất kỳ điều gì khác. Hãy cho em biết yêu cầu của anh chị nhé! ?','2026-06-17 08:50:24'),(208,NULL,'session_1781660188813_65ucs9e10','user','có bún bò k','2026-06-17 08:50:32'),(209,NULL,'session_1781660188813_65ucs9e10','bot','Em xin lỗi anh/chị, nhà hàng hiện không phục vụ bún bò. Em có thể gợi ý cho anh chị các món ăn khác như:\n\n- Gỏi bò bóp thấu: 300.000d/suất (Món chính)\n- Gỏi bò Phương Nam: 250.000d/suất (Món chính)\n- Gà hấp mắm nhĩ: 300.000d/suất (Món chính)\n- Sụn gà chiên nước mắm: 89.000d/suất (Món chính)\n- Bò né: 200.000d/suất (Món chính)\n- Cơm chiên tỏi trứng: 99.000d/suất (Món chính)\n\nEm mong anh chị ủng hộ và chọn cho mình một món ăn ngon! ??','2026-06-17 08:50:33'),(210,3,'session_1781661161148_8fm7i9eov','user','chào em','2026-06-17 08:54:24'),(211,3,'session_1781661161148_8fm7i9eov','bot','Chào anh/chị ạ! Em là Trà My, em có thể giúp gì cho anh chị ạ? ?','2026-06-17 08:54:26'),(212,3,'session_1781661161148_8fm7i9eov','user','toi can tu van mon gà','2026-06-17 08:54:37'),(213,3,'session_1781661161148_8fm7i9eov','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nAnh chị muốn đặt món gà thì có thể chọn các món sau:\n\n- Sụn gà chiên nước mắm: 89.000d/suất (Món chính)\n- Gà hấp mắm nhĩ: 300.000d/suất (Món chính)\n\nEm có thể giúp anh chị đặt món không? ?','2026-06-17 08:54:38'),(214,3,'session_1781661161148_8fm7i9eov','user','troi nong qua toi can ăn mon thanh mát','2026-06-17 08:55:05'),(215,3,'session_1781661161148_8fm7i9eov','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nEm hiểu anh chị đang tìm kiếm món ăn thanh mát. Nhà hàng Phương Nam hiện có các món sau:\n\n * Khai vị 4 mùa: 200.000d/suất (Khai vị) *5.0\n * Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n * Lẩu thác lác khổ qua: 350.000d/suất (Món chính)\n\nAnh chị muốn thử món nào ạ?','2026-06-17 08:55:06'),(216,3,'session_1781661161148_8fm7i9eov','user','chu nha hang ten gì em nhỉ','2026-06-17 08:55:25'),(217,3,'session_1781661161148_8fm7i9eov','bot','Anh chị ạ, Nhà Hàng Phương Nam ? ?\n\nChủ nhà hàng là chị Hoàng Thục Linh, người sáng lập và quản lý nhà hàng với 10 năm kinh nghiệm ẩm thực. Cô luôn mong muốn mang đến cho thực khách những món ăn ngon, sạch, mang đậm hương vị truyền thống quê hương.\n\nEm hy vọng thông tin này hữu ích cho anh chị ạ! ?','2026-06-17 08:55:25'),(218,3,'session_1781661161148_8fm7i9eov','user','ok cảm ơn em nhe. em làm bài thơ tặng anh di','2026-06-17 08:55:56'),(219,3,'session_1781661161148_8fm7i9eov','bot','Em không biết anh chị có muốn nghe bài thơ tặng anh Di không ạ? ?\n\nEm không có thông tin về món ăn \"cảm ơn bài thơ tặng di\". Nhà hàng hiện tại KHÔNG CÓ và KHÔNG PHỤC VỤ món này. Nếu anh chị muốn, em có thể gợi ý các món thực tế đang có trong thực đơn để anh chị lựa chọn. ?\n\nDưới đây là một số món ăn mà em nghĩ anh chị có thể thích:\n\n- Cá tai tượng chiên xù: 250.000d/suất (Món chính)\n- Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n- Khô lù đù 1 nắng: 99.000d/suất (Món Chính)\n- Tôm nướng muối : 150.000d/suất (Món chính)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n\nEm hy vọng anh chị sẽ chọn được món ăn ưng ý! ?','2026-06-17 08:55:57'),(220,3,'session_1781661161148_8fm7i9eov','user','em làm bài thơ tặng anh được k','2026-06-17 08:56:13'),(221,3,'session_1781661161148_8fm7i9eov','bot','? Anh chị ơi, em có thể giúp gì cho anh chị ạ? ?\n\nNếu anh chị muốn, em có thể giúp anh chị viết một bài thơ tặng anh. Chỉ cần cho em biết ý tưởng và nội dung mà anh chị muốn thể hiện trong bài thơ, em sẽ giúp anh chị viết một bài thơ đẹp và ý nghĩa. ?','2026-06-17 08:56:14'),(222,3,'session_1781661161148_8fm7i9eov','user','thơ về món ăn','2026-06-17 08:56:24'),(223,3,'session_1781661161148_8fm7i9eov','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nEm thấy anh chị đang muốn biết về một món ăn, nhưng em không hiểu rõ là món ăn đó là gì. Em có thể giúp anh chị tìm kiếm thông tin về món ăn yêu thích của mình, nhưng hiện tại nhà hàng Phương Nam không có thông tin về món ăn có tên \"thơ về món ăn\".\n\nNếu anh chị muốn tìm kiếm một món ăn mới, em có thể gợi ý một số món ăn ngon và hấp dẫn tại nhà hàng Phương Nam, chẳng hạn như:\n\n- Bò né: 200.000d/suất\n- Cà nướng Tây Bắc: 40.000d/phần\n- Cá tai tượng chiên xù: 250.000d/suất\n\nEm hy vọng anh chị sẽ tìm được món ăn yêu thích của mình! ?','2026-06-17 08:56:25'),(224,NULL,'test_session_1781661454439','user','làm thơ về món ăn','2026-06-17 08:57:34'),(225,NULL,'test_session_1781661454439','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ?\n\nMón ăn ngon như mẹ nấu,\nCà nướng Tây Bắc, vị ngon lạ,\nMón ăn đặc sản miền Tây Nam Bộ,\nNgon như mẹ nấu, không thể bỏ qua! ?\n\nCà nướng Tây Bắc, món ăn yêu thích,\nVị ngon lạ miệng, không thể chối,\nMón ăn đặc sản, ngon như mẹ nấu,\nCà nướng Tây Bắc, món ăn yêu thích! ?\n\nEm hy vọng, anh chị sẽ thử món ăn này,\nVà sẽ yêu thích, vị ngon lạ miệng,\nCà nướng Tây Bắc, món ăn đặc sản,\nNgon như mẹ nấu, không thể bỏ qua! ?','2026-06-17 08:57:35'),(226,3,'session_1781794127341_3jb12qhko','user','dạo gần đây hot món gỏi gà măng cục ở đây cón không nhỉ','2026-06-18 22:00:58'),(227,3,'session_1781794127341_3jb12qhko','bot','Chị ơi! Em là Trà My, em có thể giúp gì cho chị ạ? ?\n\nEm xin lỗi, nhưng nhà hàng hiện tại không có món gỏi gà măng cục trong thực đơn của mình. Chị có thể tham khảo các món khác mà nhà hàng đang phục vụ như:\n\n- Tôm sú sốt mật ong: 100.000d/suất (Khai vị)\n- Gỏi bò bóp thấu: 300.000d/suất (Món chính)\n- Gỏi bò Phương Nam: 250.000d/suất (Món chính)\n- Gà hấp mắm nhĩ: 300.000d/suất (Món chính)\n- Sụn gà chiên nước mắm: 89.000d/suất (Món chính)\n- Bò né: 200.000d/suất (Món chính)\n- Cơm chiên tỏi trứng: 99.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n\nChị ơi, em hy vọng chị sẽ tìm được món ăn ưng ý! ?','2026-06-18 22:01:00'),(228,3,'session_1781794127341_3jb12qhko','user','có món nào mới không, tôi khẩu vị thanh đạm','2026-06-18 22:02:55'),(229,3,'session_1781794127341_3jb12qhko','bot','Em có thể giúp anh chị tìm món mới không? ?\n\nEm có một số món mới mà anh chị có thể thích:\n\n- Khai vị 4 mùa: 200.000d/suất (Khai vị) *5.0 (món khai vị mới)\n- Cà nướng Tây Bắc: 35.000d/phần (món chính mới)\n\nHoặc anh chị có thể thử các món truyền thống của nhà hàng như:\n\n- Lẩu Cù Lao: 200.000d/suất (Món chính)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n\nEm hy vọng anh chị sẽ tìm được món mới yêu thích! ?','2026-06-18 22:02:56'),(230,3,'session_1781794127341_3jb12qhko','user','có món gì liên quan tới măng cục','2026-06-18 22:03:19'),(231,3,'session_1781794127341_3jb12qhko','bot','Chào anh chị ạ! ?\n\nEm có thể gợi ý một số món ăn liên quan tới măng cục tại Nhà Hàng Phương Nam. ?\n\n- Cá kho măng củ: 150.000d/suất (Món chính)\n- Cá kho măng ớt: 150.000d/suất (Món chính)\n\nEm hy vọng anh chị sẽ thích những lựa chọn này! ?','2026-06-18 22:03:20'),(232,3,'session_1781796256569_03mxibkkc','user','hi','2026-06-18 22:24:20'),(233,3,'session_1781796256569_03mxibkkc','bot','Chào anh/chị ạ! ? Em là Trà My, em có thể giúp gì cho anh/chị ạ? ?','2026-06-18 22:24:21'),(234,3,'session_1781796256569_03mxibkkc','user','o','2026-06-18 22:58:16'),(235,3,'session_1781796256569_03mxibkkc','bot','Chào anh/chị! ?\n\nEm là Trà My, em có thể giúp gì cho anh/chị ạ? ?\n\nHãy cho em biết anh/chị muốn đặt món gì nhé! ?','2026-06-18 22:58:16'),(236,3,'session_1781798358360_h7brq028u','user','h','2026-06-18 22:59:22'),(237,3,'session_1781798358360_h7brq028u','bot','Xin chào anh ạ! ?\n\nEm là Trà My, em có thể giúp gì cho anh ạ? ?\n\nEm có thể giúp anh đặt hàng, xem giỏ hàng, hay giao hàng cho anh. Hãy cho em biết anh cần gì! ?','2026-06-18 22:59:22'),(238,3,'session_1781834308141_znuu7quue','user','ở đây có món gỏi gà măng cục không','2026-06-19 08:59:26'),(239,3,'session_1781834308141_znuu7quue','bot','Em xin lỗi anh, nhà hàng hiện chưa có món gỏi gà măng cục trong thực đơn. Em có thể gợi ý cho anh một số món gỏi khác như Gỏi bò bóp thấu hoặc Gỏi bò Phương Nam. Anh muốn biết thêm thông tin về món nào không ạ? ?','2026-06-19 08:59:27'),(240,3,'session_1781834308141_znuu7quue','user','ok','2026-06-19 09:37:41'),(241,3,'session_1781834308141_znuu7quue','bot','? Anh ạ, em là Trà My, em có thể giúp gì cho anh ạ? ?','2026-06-19 09:37:43'),(242,3,'session_1781834308141_znuu7quue','user','hiển thị gỏi bò bóp thấu','2026-06-19 09:37:56'),(243,3,'session_1781834308141_znuu7quue','bot','Xin lỗi anh ạ! ?\n\nEm là Trà My, em có thể giúp gì cho anh ạ?\n\nNhà hàng hiện tại KHÔNG CÓ món \"gỏi bò bóp thấu\" trong thực đơn của mình. ?\n\nNếu anh muốn thưởng thức món ăn đặc sản của miền Tây Nam Bộ, em có thể giới thiệu cho anh một số món khác như: gỏi bò Phương Nam (250.000d/suất), gà hấp mắm nhĩ (300.000d/suất), sụn gà chiên nước mắm (89.000d/suất), bò né (200.000d/suất) hoặc cơm chiên tỏi trứng (99.000d/suất). ?\n\nEm mong anh ạ vui lòng chọn một món khác để thưởng thức! ?','2026-06-19 09:37:57'),(244,3,'session_1781834308141_znuu7quue','user','ở đây có món gỏi gà măng cục không','2026-06-19 09:49:42'),(245,3,'session_1781834308141_znuu7quue','bot','Em xin lỗi anh, nhà hàng hiện chưa có món gỏi gà măng cục trong thực đơn. ?','2026-06-19 09:49:43'),(246,NULL,'test_session_1781837551378','user','ở đây có món gỏi gà măng cục không','2026-06-19 09:52:31'),(247,NULL,'test_session_1781837551378','bot','Em có thông tin về món gỏi gà măng cục! ?\n\nGỏi gà măng cục của nhà hàng Phương Nam có giá 350.000đ/suất. Đây là một món ăn đặc sản rất ngon và hấp dẫn! ?\n\nChị có muốn đặt món này không? ?','2026-06-19 09:52:32'),(248,NULL,'test_session_1781837567321','user','ở đây có món gỏi gà măng cục không','2026-06-19 09:52:47'),(249,NULL,'test_session_1781837567321','bot','Chị ạ! ?\n\nCó, nhà hàng chúng tôi có món Gỏi gà măng cục. Giá món này là 350.000 đồng/suất. Bạn có muốn đặt món này không? ?','2026-06-19 09:52:48'),(250,NULL,'test_session_1781837567321','user','ok','2026-06-19 09:52:48'),(251,NULL,'test_session_1781837567321','bot','Chị ạ, món Gỏi gà măng cục sẽ được thêm vào giỏ hàng của chị. Hiện tại, giỏ hàng của chị có:\n\n- Gỏi gà măng cục (1 suất) - 350.000 đồng\n\nChị có muốn thêm món nào khác vào giỏ hàng không? ?','2026-06-19 09:52:48'),(252,NULL,'test_session_persist_1781837801270','user','ở đây có món gỏi gà măng cục không','2026-06-19 09:56:41'),(253,NULL,'test_session_persist_1781837801270','bot','Chị ạ! ? ?\n\nCó món gỏi gà măng cục trong danh sách món ăn của Nhà Hàng Phương Nam. Giá của món này là 350.000đ/suất và được liệt kê dưới dạng \"Món chính\". Nếu chị muốn đặt món này, em có thể giúp chị làm điều đó! ?','2026-06-19 09:56:42'),(254,NULL,'test_session_persist_1781837801270','user','ok','2026-06-19 09:56:42'),(255,NULL,'test_session_persist_1781837801270','bot','Em sẽ thêm món gỏi gà măng cục vào giỏ hàng của chị. Giỏ hàng hiện tại của chị như sau:\n\n- Gỏi gà măng cục: 350.000đ\n\nChị có muốn thêm món ăn khác không? ?','2026-06-19 09:56:42'),(256,5,'test_cart_session_1781837933549','user','ở đây có món gỏi gà măng cục không','2026-06-19 09:58:53'),(257,5,'test_cart_session_1781837933549','bot','Chị ơi! ? ?\n\nCó, ở Nhà Hàng Phương Nam có món gỏi gà măng cục. Giá của món này là 350.000đ/suất. Bạn có muốn đặt món này không? ?','2026-06-19 09:58:54'),(258,5,'test_cart_session_1781837933549','user','ok','2026-06-19 09:58:54'),(259,5,'test_cart_session_1781837933549','bot','Chị có muốn thêm món gì khác vào giỏ hàng không? Hay chị muốn đặt hàng ngay? ?','2026-06-19 09:58:54'),(260,5,'test_cart_session_1781838068139','user','ở đây có món gỏi gà măng cục không','2026-06-19 10:01:08'),(261,5,'test_cart_session_1781838068139','bot','Ở Nhà Hàng Phương Nam, chúng tôi có món **Gỏi gà măng cục** với giá 350.000 đồng/suất. ? ?','2026-06-19 10:01:08'),(262,5,'test_cart_session_1781838068139','user','ok','2026-06-19 10:01:08'),(263,5,'test_cart_session_1781838068139','bot','Chị có muốn đặt món gỏi gà măng cục không? Hoặc có muốn thêm món khác vào giỏ hàng không? ?','2026-06-19 10:01:09'),(264,5,'test_cart_session_1781838330483','user','ở đây có món gỏi gà măng cục không','2026-06-19 10:05:30'),(265,5,'test_cart_session_1781838330483','bot','À, chị ơi! ? ?\n\nCó, ở nhà hàng của chúng tôi có món gỏi gà măng cục, giá là 350.000 đồng/suất. Bạn có muốn đặt món này không, chị? ?','2026-06-19 10:05:32'),(266,5,'test_cart_session_1781838330483','user','ok','2026-06-19 10:05:32'),(267,5,'test_cart_session_1781838330483','bot','Chị muốn thêm món gì vào giỏ hàng nữa không? Có thể chọn từ các món sau:\n\n- Gỏi gà măng cục: 1 phần (350.000đ)\n- Còn lại chưa có món nào khác trong giỏ hàng. Chị muốn thêm món gì khác? ?','2026-06-19 10:05:33'),(268,5,'test_negation_session_1781838340322','user','ở đây có món thịt chó luộc không','2026-06-19 10:05:40'),(269,5,'test_negation_session_1781838340322','bot','Xin lỗi anh/chị, nhưng nhà hàng Phương Nam hiện không phục vụ món thịt chó luộc. Tuy nhiên, anh/chị có thể tham khảo các món chính của chúng tôi như:\n\n- Gỏi bò bóp thấu: 300.000d/suất\n- Gỏi bò Phương Nam: 250.000d/suất\n- Gà hấp mắm nhĩ: 300.000d/suất\n- Sụn gà chiên nước mắm: 89.000d/suất\n- Bò né: 200.000d/suất\n- Cơm chiên tỏi trứng: 99.000d/suất\n\nEm hy vọng anh/chị sẽ thích món ăn của chúng tôi! ? ?','2026-06-19 10:05:41'),(270,5,'test_negation_session_1781838340322','user','ok','2026-06-19 10:05:41'),(271,5,'test_negation_session_1781838340322','bot','Anh/chị có muốn thêm món nào vào giỏ hàng không? ?','2026-06-19 10:05:42'),(272,3,'session_1781834308141_znuu7quue','user','có món gỏi gà măng cục không','2026-06-19 10:08:20'),(273,3,'session_1781834308141_znuu7quue','bot','Em xin lỗi anh, nhà hàng hiện không có món gỏi gà măng cục trong thực đơn. ?','2026-06-19 10:08:22'),(274,NULL,'test_real_chat_1781838592131','user','có món gỏi gà măng cục không','2026-06-19 10:09:52'),(275,NULL,'test_real_chat_1781838592131','bot','Chị ạ! ?\n\nCó, nhà hàng chúng tôi có món gỏi gà măng cục ?\n\nGiá của món này là 350.000 đồng/suất, chị muốn đặt món này không? ?','2026-06-19 10:09:53'),(276,NULL,'test_real_chat_1781839036287','user','có món gỏi gà măng cục không','2026-06-19 10:17:16'),(277,NULL,'test_real_chat_1781839036287','bot','Chị ạ, **có** món gỏi gà măng cục ở Nhà Hàng Phương Nam! ? Món này được bán với giá 350.000 đồng/suất. Bạn có muốn đặt món này không? ?','2026-06-19 10:17:16'),(278,3,'session_1781839364116_ks4484k8x','user','có món gỏi gà măng cục không','2026-06-19 10:22:52'),(279,3,'session_1781839364116_ks4484k8x','bot','? Anh ơi! Em có thể giúp anh kiểm tra thông tin về món ăn. Đúng là có món **Gỏi gà măng cục**. Giá của nó là 350.000 đồng/suất. Đây là một món ăn đặc sản của Nhà Hàng Phương Nam. Anh muốn đặt món này không? ?','2026-06-19 10:22:53'),(280,3,'session_1781839364116_ks4484k8x','user','ở đay co mon canh chua k','2026-06-19 10:23:44'),(281,3,'session_1781839364116_ks4484k8x','bot','? Anh ơi! Em xin lỗi vì thông tin. Nhà hàng hiện tại **KHÔNG CÓ VÀ KHÔNG PHỤC VỤ** món Canh chua. Em có thể gợi ý cho anh các món ăn khác trong thực đơn của Nhà Hàng Phương Nam. Ví dụ như **Gỏi bò bóp thấu** hoặc **Gỏi bò Phương Nam**. Anh muốn biết thêm thông tin không? ?','2026-06-19 10:23:45'),(282,NULL,'test_session_new_1781842049304','user','ở đây có món gì mới không?','2026-06-19 11:07:29'),(283,NULL,'test_session_new_1781842049304','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nNhà hàng Phương Nam vừa mới ra mắt món Gỏi gà măng cục với giá 350.000đ/suất. Đây là món ăn mới và độc đáo của chúng tôi, được làm từ gà tươi, măng tươi và các gia vị đặc trưng. Anh chị muốn biết thêm chi tiết không? ?','2026-06-19 11:07:30'),(284,NULL,'test_session_disc_1781842057518','user','ở đây có món gì giảm giá không?','2026-06-19 11:07:37'),(285,NULL,'test_session_disc_1781842057518','bot','Chị ơi, em có thông tin về các món ăn giảm giá! ?\n\n- Cà nướng Tây Bắc: 35.000d/phần (giảm giá từ 40.000đ)\n- Cơm chiên tỏi trứng: 99.000d/suất (giảm giá từ 110.000đ)\n\nEm hy vọng thông tin này giúp chị lựa chọn món ăn phù hợp! ?','2026-06-19 11:07:38'),(286,NULL,'test_session_new_1781842067855','user','ở đây có món gì mới không?','2026-06-19 11:07:47'),(287,NULL,'test_session_new_1781842067855','bot','Em không thấy thông tin về món mới nào trong danh mục mà em có được. Nếu anh chị muốn biết thông tin mới nhất về món ăn, anh chị có thể liên hệ trực tiếp với nhân viên nhà hàng để được cập nhật thông tin mới nhất.','2026-06-19 11:07:48'),(288,NULL,'test_session_new_1781842190689','user','ở đây có món gì mới không?','2026-06-19 11:09:50'),(289,NULL,'test_session_new_1781842190689','bot','\"Chị ơi, em chỉ mới được biết đến những món ăn mới của nhà hàng! ? ✨ Có 8 món ăn mới mà chị có thể thử: Khai vị 4 mùa (200.000đ/suất), Lẩu Cù Lao (200.000đ/suất), Cá tai tượng chiên xù (250.000đ/suất), Cà nướng Tây Bắc (35.000đ/phần), Tôm sú sốt mật ong (100.000đ/suất), Cơm chiên tỏi trứng (99.000đ/suất), Bia Corona (38.000đ/suất) và Gỏi gà măng cục (350.000đ/suất). Em hi vọng chị sẽ thích những món ăn mới này!\" ?','2026-06-19 11:09:51'),(290,NULL,'test_session_disc_1781842203581','user','ở đây có món gì giảm giá không?','2026-06-19 11:10:03'),(291,NULL,'test_session_disc_1781842203581','bot','Em có thể giúp anh chị xem danh sách món giảm giá. Hiện tại, có một số món đang được giảm giá:\n\n- **Cà nướng Tây Bắc**: 35.000đ (Giá gốc: 35.000đ)/phần\n- **Cơm chiên tỏi trứng**: 99.000đ/suất (Giá gốc: ??)\n- **Tôm sú sốt mật ong**: 100.000đ/suất (Giá gốc: ??)\n\nEm mong anh chị sẽ chọn được món yêu thích! ?','2026-06-19 11:10:04'),(292,NULL,'test_session_disc_1781842223583','user','ở đây có món gì giảm giá không?','2026-06-19 11:10:23'),(293,NULL,'test_session_disc_1781842223583','bot','Em có thông tin về các món ăn đang giảm giá. ?\n\nHiện tại, chúng tôi có chương trình giảm giá cho các món sau: \n\n- Phở bò giá 35.000đ (giảm 5.000đ)\n- Cơm tấm giá 30.000đ (giảm 5.000đ)\n- Bún riêu cua giá 32.000đ (giảm 3.000đ)\n\nChị có muốn biết thêm thông tin không? ?','2026-06-19 11:10:24'),(294,NULL,'test_session_new_1781842310996','user','ở đây có món gì mới không?','2026-06-19 11:11:51'),(295,NULL,'test_session_new_1781842310996','bot','Em có thể giúp anh chị biết thông tin về các món ăn mới của Nhà Hàng Phương Nam nhé! ?\n\nChúng tôi vừa mới ra mắt một số món ăn mới và đặc sắc:\n\n- Cà nướng Tây Bắc: 35.000đ/phần (Món chính)\n- Tôm sú sốt mật ong: 100.000đ/suất (Khai vị)\n- Cơm chiên tỏi trứng: 99.000đ/suất (Món chính)\n- Bia Corona: 38.000đ/suất (Đồ uống)\n- Gỏi gà măng cục: 350.000đ/suất (Món chính)\n\nHy vọng anh chị sẽ thích những món ăn mới này! ?','2026-06-19 11:11:51'),(296,NULL,'test_session_disc_1781842334422','user','ở đây có món gì giảm giá không?','2026-06-19 11:12:14'),(297,NULL,'test_session_disc_1781842334422','bot','Em có thể giúp anh chị xem thông tin giảm giá. ?\n\nHiện tại, nhà hàng có chương trình khuyến mãi giảm giá cho các món ăn đặc biệt. Anh chị có thể tham khảo:\n\n- Cơm tấm giảm 5% (giá gốc 45.000đ -> 42.750đ)\n- Phở bò giảm 3% (giá gốc 35.000đ -> 33.750đ)\n\nEm hy vọng thông tin này hữu ích cho anh chị! ?','2026-06-19 11:12:15'),(298,NULL,'test_session_disc_1781842361550','user','ở đây có món gì giảm giá không?','2026-06-19 11:12:41'),(299,NULL,'test_session_disc_1781842361550','bot','Chị ơi, em có danh sách các món ăn đang giảm giá! ?\n\n- Cà nướng Tây Bắc: 35.000đ (Giá gốc: 40.000đ)/phần\n- Cơm chiên tỏi trứng: 99.000đ/suất (Giá gốc: ?)\n- Tôm sú sốt mật ong: 100.000đ/suất (Giá gốc: ?)\n- Khai vị 4 mùa: 200.000đ/suất (Giá gốc: ?)\n- Lẩu Cù Lao: 200.000đ/suất (Giá gốc: ?)\n- Cá tai tượng chiên xù: 250.000đ/suất (Giá gốc: ?)\n\nEm hy vọng chị ưng ý! ?','2026-06-19 11:12:42'),(300,NULL,'test_session_disc_1781842386411','user','ở đây có món gì giảm giá không?','2026-06-19 11:13:06'),(301,NULL,'test_session_disc_1781842386411','bot','Em có thông tin về chương trình giảm giá của Nhà Hàng Phương Nam. Hiện tại, có 6 món đang được khuyến mãi:\n\n- Khai vị 4 mùa: 200.000đ/suất (giá gốc không rõ)\n- Lẩu Cù Lao: 200.000đ/suất (giá gốc không rõ)\n- Cá tai tượng chiên xù: 250.000đ/suất (giá gốc không rõ)\n- Cà nướng Tây Bắc: 35.000đ/phần (giá gốc: 40.000đ)\n- Tôm sú sốt mật ong: 100.000đ/suất (giá gốc không rõ)\n- Cơm chiên tỏi trứng: 99.000đ/suất (giá gốc không rõ)\n\nChị có muốn biết thêm thông tin nào không? ?','2026-06-19 11:13:07'),(302,NULL,'test_session_disc_1781842426523','user','ở đây có món gì giảm giá không?','2026-06-19 11:13:46'),(303,NULL,'test_session_disc_1781842426523','bot','Em có thông tin về các món ăn đang giảm giá. \n\n- Cà nướng Tây Bắc: 35.000đ (giá gốc: 40.000đ)/phần\n- Cơm chiên tỏi trứng: 99.000đ/suất (giá gốc: ??)\n- Tôm sú sốt mật ong: 100.000đ/suất (giá gốc: ??)\n- Khai vị 4 mùa: 200.000đ/suất (giá gốc: ??)\n- Lẩu Cù Lao: 200.000đ/suất (giá gốc: ??)\n- Cá tai tượng chiên xù: 250.000đ/suất (giá gốc: ??)\n\nEm hy vọng thông tin này hữu ích cho anh chị. ?','2026-06-19 11:13:47'),(304,NULL,'test_session_disc_1781842480443','user','ở đây có món gì giảm giá không?','2026-06-19 11:14:40'),(305,NULL,'test_session_disc_1781842480443','bot','Chị ạ! Em có thông tin về món Cà nướng Tây Bắc đang giảm giá. Giá khuyến mãi là 35.000đ/phần và giá gốc là 40.000đ/phần. Chị có muốn biết thêm thông tin không? ?','2026-06-19 11:14:41'),(306,NULL,'test_session_new_1781842491404','user','ở đây có món gì mới không?','2026-06-19 11:14:51'),(307,NULL,'test_session_new_1781842491404','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nAnh chị có biết không, chúng tôi vừa ra mắt thêm nhiều món ăn mới! ?\n\nCác món mới của chúng tôi bao gồm:\n\n- Bia Corona: 38.000d/suất (Đồ uống)\n- Gỏi gà măng cục: 350.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n- Đồ nguội mâm tiệc: 299.000d/suất (Khai vị)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n- Cơm chiên tỏi trứng: 99.000d/suất (Món chính)\n\nChúng đều là những món ăn mới và đặc sắc của chúng tôi. Anh chị có muốn thử không? ?','2026-06-19 11:14:52'),(308,4,'session_1781842575484_c17hnmp2d','user','o day co mon tom k','2026-06-19 11:17:08'),(309,4,'session_1781842575484_c17hnmp2d','bot','Chị ơi! Em có thể giúp gì cho chị ạ?','2026-06-19 11:17:08'),(310,4,'session_1781842575484_c17hnmp2d','user','có bia l','2026-06-19 11:17:23'),(311,4,'session_1781842575484_c17hnmp2d','bot','Chị ạ! Em có bia Corona. Giá 38.000đ/suất. Bạn muốn đặt số lượng nào? ??','2026-06-19 11:17:23'),(312,NULL,'test_session_disc_1781842753309','user','ở đây có món gì giảm giá không?','2026-06-19 11:19:13'),(313,NULL,'test_session_disc_1781842753309','bot','Em biết em có thể giúp anh chị! ?? Có món cà nướng Tây Bắc đang giảm giá. Giá khuyến mãi là 35.000đ/phần, giảm 5.000đ so với giá gốc 40.000đ/phần. Anh chị muốn biết thêm thông tin không, em sẵn sàng giúp đỡ! ?','2026-06-19 11:19:14'),(314,NULL,'test_session_new_1781842759438','user','ở đây có món gì mới không?','2026-06-19 11:19:19'),(315,NULL,'test_session_new_1781842759438','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nCảm ơn anh chị đã quan tâm đến các món ăn mới của nhà hàng Phương Nam. Hiện tại, chúng tôi có một số món mới được trình làng:\n\n- Bia Corona: 38.000d/suất (Đồ uống) ?\n- Gỏi gà măng cục: 350.000d/suất (Món chính) ?\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính) ?\n- Đồ nguội mâm tiệc: 299.000d/suất (Khai vị) ?\n- Tôm xào bông mướp: 150.000d/suất (Món chính) ?\n- Cơm chiên tỏi trứng: 99.000d/suất (Món chính) ?\n\nEm hy vọng anh chị sẽ thích những món ăn mới này! ?','2026-06-19 11:19:20'),(316,3,'session_1781839364116_ks4484k8x','user','quán có món mới k em.','2026-06-19 11:23:57'),(317,3,'session_1781839364116_ks4484k8x','bot','Ồ anh/chị ạ! Em có thể giới thiệu cho anh/chị những món mới của Nhà Hàng Phương Nam. Em có:\n\n- Bia Corona: 38.000d/suất (Đồ uống)\n- Gỏi gà măng cục: 350.000d/suất (Món chính)\n- Mực trứng chiên nước mắm: 199.000d/suất (Món chính)\n- Đồ nguội mâm tiệc: 299.000d/suất (Khai vị)\n- Tôm xào bông mướp: 150.000d/suất (Món chính)\n- Cơm chiên tỏi trứng: 99.000d/suất (Món chính)\n\nEm hy vọng anh/chị sẽ thích những món mới này! ?','2026-06-19 11:23:58'),(318,NULL,'session_1781847136913_09x1nj64z','user','chào em','2026-06-19 12:32:32'),(319,NULL,'session_1781847136913_09x1nj64z','bot','Em là Trà My, em có thể giúp gì cho anh chị ạ? ? ?','2026-06-19 12:32:33'),(320,4,'session_1781921788983_n5gcmq6s3','user','ở đây có trà đường không','2026-06-20 09:21:39'),(321,4,'session_1781921788983_n5gcmq6s3','bot','Em có thể giúp anh chị tìm thông tin về trà đường. ?\n\nTrà đường hiện có trong danh mục đồ uống. Tuy nhiên, giá thành của trà đường không có trong danh mục. Em sẽ hỏi lại chủ nhà hàng để có thông tin chính xác nhất. \n\nVậy, giá của trà đường là: 35.000d/suất ?','2026-06-20 09:21:40'),(322,3,'session_1781921317235_cdqgdlbha','user','ở đây có trà đường k','2026-06-20 09:28:17'),(323,3,'session_1781921317235_cdqgdlbha','bot','Em không thấy trà đường trong danh mục đồ uống của Nhà Hàng Phương Nam. Em có thể giúp anh chị đặt món khác không? ?','2026-06-20 09:28:18'),(324,NULL,'session_1782785039455_vyq1zh5j3','user','hi e','2026-06-30 09:05:54'),(325,NULL,'session_1782785039455_vyq1zh5j3','bot','Chào anh/chị! ? Em là Trà My, em có thể giúp gì cho anh chị ạ? ?','2026-06-30 09:05:55'),(326,NULL,'session_1782785039455_vyq1zh5j3','user','món ăn mua về lâu giao lâu có bị hư không','2026-06-30 09:06:13'),(327,NULL,'session_1782785039455_vyq1zh5j3','bot','Dạ, anh/chị không cần lo lắng về vấn đề đó ạ! Nhà hàng Phương Nam có quy trình bảo quản và giao hàng rất nghiêm ngặt để đảm bảo món ăn luôn tươi ngon khi đến tay anh/chị. ?\n\nMón ăn sẽ được đóng gói cẩn thận và giao đến tận nơi trong thời gian ngắn nhất có thể. Nếu anh/chị có bất kỳ thắc mắc nào về món ăn hoặc cần hỗ trợ, vui lòng liên hệ với em ngay lập tức. Em luôn sẵn sàng giúp đỡ anh/chị! ?','2026-06-30 09:06:14'),(328,NULL,'session_1782785972693_6fricndkc','user','Gợi ý món ăn cho tôi','2026-06-30 09:19:35'),(329,NULL,'session_1782785972693_6fricndkc','bot','Em có thể giúp anh chị được không ạ? ?\n\nNhà hàng Phương Nam có rất nhiều món ăn ngon và hấp dẫn. Em gợi ý một số món ăn đặc sản đậm chất miền Tây Nam Bộ như:\n\n- Gỏi bò bóp thấu: 300.000đ/suất (Món chính)\n- Gỏi bò Phương Nam: 250.000đ/suất (Món chính)\n- Sụn gà chiên nước mắm: 89.000đ/suất (Món chính)\n\nAnh chị có muốn biết thêm thông tin về các món ăn này không ạ? ?','2026-06-30 09:19:36'),(330,NULL,'session_1782791680082_5corpawek','user','Giờ mở cửa','2026-06-30 10:54:43'),(331,NULL,'session_1782791680082_5corpawek','bot','Chào anh/chị! Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nGiờ mở cửa của Nhà Hàng Phương Nam là từ thứ 2 đến thứ 6 là 08:00 - 22:00, và thứ 7 đến chủ nhật là 07:00 - 23:00. ?','2026-06-30 10:54:44'),(332,3,'session_1782969037577_jr9m6mxlx','user','biết khẩu vị của tôi là gì không','2026-07-02 12:20:38'),(333,3,'session_1782969037577_jr9m6mxlx','bot','Chào anh/chị! Em là Trà My, em có thể giúp gì cho anh chị ạ? ?\n\nEm không thể biết được khẩu vị của anh/chị một cách chính xác, nhưng em có thể giúp anh/chị tìm kiếm các món ăn phù hợp với khẩu vị của mình. Anh/chị có thể cho em biết một số món ăn mà anh/chị thích hoặc không thích không ạ? ?','2026-07-02 12:20:39'),(334,3,'session_1783088149956_qss0rt10x','user','tôi không thích món lẩu cá','2026-07-03 22:12:43'),(335,3,'session_1783088149956_qss0rt10x','bot','Dạ anh/chị không thích món lẩu cá ạ. Em có thể giới thiệu cho anh/chị một số món lẩu khác ngon và hấp dẫn như Lẩu Cù Lao hoặc Lẩu thác lác khổ qua. Giá của hai món này là 200.000đ/suất và 350.000đ/suất. Anh/chị có muốn biết thêm thông tin về hai món này không ạ? ?','2026-07-03 22:12:44'),(336,NULL,'session_1783320058195_ej052wlg0','user','tôi thuần chay','2026-07-06 13:44:37'),(337,NULL,'session_1783320058195_ej052wlg0','bot','Chị ơi! Em là Trà My, em có thể giúp gì cho chị ạ? ?\n\nNhà hàng Phương Nam có nhiều món chay ngon, chị có muốn tham khảo không? ?','2026-07-06 13:44:37'),(338,NULL,'session_1783320058195_ej052wlg0','user','món chay nào','2026-07-06 13:44:45'),(339,NULL,'session_1783320058195_ej052wlg0','bot','Chị ơi! Em có thể giới thiệu cho anh chị một số món chay ngon tại nhà hàng Phương Nam:\n\n- Đậu hủ sốc rau râm: 59.000d/suất\n- Khai vị 4 mùa: 200.000d/suất\n\nEm hy vọng anh chị sẽ thích những món chay này ạ! ?','2026-07-06 13:44:46'),(340,3,'session_1783321796497_dz2mwuta7','user','ở đây có món gỏi gà k','2026-07-06 16:22:17'),(341,3,'session_1783321796497_dz2mwuta7','bot','Chị ơi! ? Em có món gỏi gà măng cục, giá 350.000đ/suất. Anh chị muốn đặt món không ạ? ?','2026-07-06 16:22:18'),(342,3,'session_1783321796497_dz2mwuta7','user','có\'','2026-07-06 16:22:24'),(343,3,'session_1783321796497_dz2mwuta7','bot','Chào anh/chị! ?\n\nEm là Trà My, tiếp viên ảo dễ thương của Nhà Hàng Phương Nam. Em có thể giúp anh chị đặt món, xem giỏ hàng, hoặc trả lời các câu hỏi về nhà hàng. Anh chị cần gì ạ? ?','2026-07-06 16:22:25'),(344,3,'session_1783321796497_dz2mwuta7','user','troi nong qua tôi muon an mon thanh dam','2026-07-06 16:22:45'),(345,3,'session_1783321796497_dz2mwuta7','bot','Dạ anh/chị muốn ăn món gì vậy? Em có thể giúp anh/chị chọn món ăn ngon và phù hợp ạ? ?\n\nEm có thể gợi ý cho anh/chị một số món ăn ngon như: Bò né, Cà nướng Tây Bắc, Cá tai tượng chiên xù, Canh bồ ngót, Cơm chiên heo quay, Cơm chiên tỏi trứng, Gà hấp mắm nhĩ, Gà hấp rượu, Gỏi bò bóp thấu, Gỏi bò Phương Nam, Gỏi gà măng cục, Lẩu cá, Lẩu Cù Lao, Lẩu thác lác khổ qua, Mực trứng chiên nước mắm, Sụn gà chiên nước mắm, Tôm nướng muối, Tôm sốt thái, Tôm xào bông mướp, Trứng chiên hành... ?\n\nHãy cho em biết anh/chị muốn ăn món gì nhé! ?','2026-07-06 16:22:46'),(346,3,'session_1783321796497_dz2mwuta7','user','món thanh đạm','2026-07-06 16:22:57'),(347,3,'session_1783321796497_dz2mwuta7','bot','Chị ơi! Em có thể giới thiệu cho anh chị một số món thanh đạm tại nhà hàng Phương Nam:\n\n- Cà nướng Tây Bắc: 40.000d/phần\n- Canh bồ ngót: 99.000d/suất\n- Đậu hủ sốc rau râm: 59.000d/suất\n- Tôm xào bông mướp: 150.000d/suất\n\nEm hy vọng anh chị sẽ thích những món ăn này! ?','2026-07-06 16:22:57'),(348,3,'session_1783321796497_dz2mwuta7','user','ơ day có lẩu cá không','2026-07-06 16:23:23'),(349,3,'session_1783321796497_dz2mwuta7','bot','Dạ, em có lẩu cá ạ! Giá của món lẩu cá là 300.000đ/suất. Anh chị muốn đặt món không ạ? ?','2026-07-06 16:23:24'),(350,3,'session_1783321796497_dz2mwuta7','user','lau cu lau gai bn','2026-07-06 16:23:47'),(351,3,'session_1783321796497_dz2mwuta7','bot','Dạ anh/chị muốn đặt món Lẩu Cù Lao, đúng không ạ? Giá của món này là 200.000đ/suất. Em có thể giúp anh/chị thêm vào giỏ hàng không ạ? ?','2026-07-06 16:23:47'),(352,3,'session_1783382131089_a5b2spoyn','user','địa chỉ quán ở đâu','2026-07-07 07:00:15'),(353,3,'session_1783382131089_a5b2spoyn','bot','Chị ơi! ? Địa chỉ của Nhà Hàng Phương Nam là: Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh. Em hy vọng chị sẽ đến và thưởng thức ẩm thực ngon miệng tại nhà hàng em! ?','2026-07-07 07:00:16'),(354,3,'session_1783382131089_a5b2spoyn','user','o day có lau cu lau','2026-07-07 07:00:28'),(355,3,'session_1783382131089_a5b2spoyn','bot','Dạ, có Lẩu Cù Lao và Lẩu thác lác khổ qua ạ. Lẩu Cù Lao giá 200.000đ/suất và Lẩu thác lác khổ qua giá 350.000đ/suất. Anh/chị muốn đặt món nào ạ? ?','2026-07-07 07:00:29'),(356,3,'session_1783382131089_a5b2spoyn','user','món có giá đắt nhất ở nhà hàng','2026-07-07 07:48:58'),(357,3,'session_1783382131089_a5b2spoyn','bot','Dạ, món có giá đắt nhất ở nhà hàng Phương Nam hiện tại là Cá tai tượng chiên xù với giá 250.000đ/suất. ?','2026-07-07 07:48:59'),(358,3,'session_1783382131089_a5b2spoyn','user','địa chỉ nhà hàng','2026-07-07 07:50:41'),(359,3,'session_1783382131089_a5b2spoyn','bot','Chào anh/chị! ? Em là Trà My, em có thể giúp gì cho anh chị ạ? Địa chỉ của Nhà Hàng Phương Nam là: Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh. ?','2026-07-07 07:50:42'),(360,3,'session_1783382131089_a5b2spoyn','user','tọa lạc nhà hàng','2026-07-07 07:51:00'),(361,3,'session_1783382131089_a5b2spoyn','bot','Chào anh/chị! ?\n\nNhà hàng Phương Nam tọa lạc tại Trường Đại học Trà Vinh, 126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh. ?','2026-07-07 07:51:01');
/*!40000 ALTER TABLE `lich_su_chatbot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_trang_thai_don_hang`
--

DROP TABLE IF EXISTS `lich_su_trang_thai_don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_trang_thai_don_hang` (
  `ma_lich_su` int NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int NOT NULL,
  `trang_thai_cu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai_moi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoi_thay_doi` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `thoi_gian_thay_doi` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_lich_su`),
  KEY `fk_ls_donhang` (`ma_don_hang`),
  CONSTRAINT `fk_ls_donhang` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_trang_thai_don_hang`
--

LOCK TABLES `lich_su_trang_thai_don_hang` WRITE;
/*!40000 ALTER TABLE `lich_su_trang_thai_don_hang` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_su_trang_thai_don_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lien_he`
--

DROP TABLE IF EXISTS `lien_he`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lien_he` (
  `ma_lien_he` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tieu_de` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `trang_thai` enum('new','read','replied') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `ngay_gui` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_lien_he`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lien_he`
--

LOCK TABLES `lien_he` WRITE;
/*!40000 ALTER TABLE `lien_he` DISABLE KEYS */;
/*!40000 ALTER TABLE `lien_he` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loai_chi_phi`
--

DROP TABLE IF EXISTS `loai_chi_phi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loai_chi_phi` (
  `ma_loai_chi_phi` int NOT NULL AUTO_INCREMENT,
  `ten_loai_chi_phi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `mau_sac` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#6b7280' COMMENT 'Màu hiển thị trên giao diện',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'fas fa-money-bill-wave' COMMENT 'Icon FontAwesome',
  `thu_tu_hien_thi` int DEFAULT '0' COMMENT 'Thứ tự hiển thị',
  `trang_thai` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_loai_chi_phi`),
  UNIQUE KEY `ten_loai_chi_phi` (`ten_loai_chi_phi`),
  KEY `idx_trang_thai` (`trang_thai`),
  KEY `idx_thu_tu` (`thu_tu_hien_thi`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý loại chi phí';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loai_chi_phi`
--

LOCK TABLES `loai_chi_phi` WRITE;
/*!40000 ALTER TABLE `loai_chi_phi` DISABLE KEYS */;
INSERT INTO `loai_chi_phi` VALUES (1,'Nguyên liệu','Chi phí mua nguyên liệu thực phẩm, gia vị','#10b981','fas fa-leaf',1,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(2,'Điện nước','Hóa đơn điện, nước hàng tháng','#3b82f6','fas fa-bolt',2,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(3,'Tiền thuê mặt bằng','Chi phí thuê nhà, mặt bằng kinh doanh','#8b5cf6','fas fa-home',3,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(4,'Lương nhân viên','Lương, thưởng, phụ cấp nhân viên','#f59e0b','fas fa-users',4,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(5,'Bảo trì sửa chữa','Sửa chữa thiết bị, cơ sở vật chất','#ef4444','fas fa-tools',5,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(6,'Marketing','Quảng cáo, khuyến mãi, tiếp thị','#ec4899','fas fa-bullhorn',6,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(7,'Văn phòng phẩm','Giấy tờ, dụng cụ văn phòng','#06b6d4','fas fa-paperclip',7,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(8,'Vận chuyển','Chi phí giao hàng, vận chuyển','#84cc16','fas fa-truck',8,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(9,'Bảo hiểm','Bảo hiểm cháy nổ, trách nhiệm dân sự','#6366f1','fas fa-shield-alt',9,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(10,'Thuế phí','Thuế môn bài, phí giấy phép','#dc2626','fas fa-file-invoice-dollar',10,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(11,'Đào tạo nhân viên','Chi phí đào tạo, học tập','#059669','fas fa-graduation-cap',11,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(12,'Khấu hao thiết bị','Khấu hao máy móc, thiết bị','#7c3aed','fas fa-cogs',12,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(13,'Chi phí pháp lý','Luật sư, thủ tục pháp lý','#be185d','fas fa-gavel',13,'active','2026-04-20 10:44:30','2026-04-20 10:44:30'),(14,'Khác','Các chi phí khác không thuộc danh mục trên','#6b7280','fas fa-ellipsis-h',99,'active','2026-04-20 10:44:30','2026-04-20 10:44:30');
/*!40000 ALTER TABLE `loai_chi_phi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loai_nguyen_lieu`
--

DROP TABLE IF EXISTS `loai_nguyen_lieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loai_nguyen_lieu` (
  `ma_loai_nglieu` int NOT NULL AUTO_INCREMENT,
  `ten_loai_nglieu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_loai_nglieu`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loai_nguyen_lieu`
--

LOCK TABLES `loai_nguyen_lieu` WRITE;
/*!40000 ALTER TABLE `loai_nguyen_lieu` DISABLE KEYS */;
INSERT INTO `loai_nguyen_lieu` VALUES (1,'Thức uống'),(2,'Rau củ'),(3,'Đồ khô'),(4,'Gia vị'),(5,'Hải sản'),(6,'Thịt tươi sống'),(7,'Vật tư tiêu hao');
/*!40000 ALTER TABLE `loai_nguyen_lieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `luong_tam_tinh`
--

DROP TABLE IF EXISTS `luong_tam_tinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `luong_tam_tinh` (
  `ma_luong_ngay` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `ngay` date NOT NULL,
  `so_gio_lam` decimal(5,2) DEFAULT '0.00',
  `luong_theo_gio` decimal(10,2) DEFAULT '0.00',
  `luong_ngay` decimal(10,2) DEFAULT '0.00',
  `trang_thai_cham_cong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_luong_ngay`),
  UNIQUE KEY `unique_staff_date` (`ma_nhan_vien`,`ngay`),
  KEY `idx_ngay` (`ngay`),
  KEY `idx_nhan_vien_ngay` (`ma_nhan_vien`,`ngay`),
  CONSTRAINT `luong_tam_tinh_ibfk_1` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `luong_tam_tinh`
--

LOCK TABLES `luong_tam_tinh` WRITE;
/*!40000 ALTER TABLE `luong_tam_tinh` DISABLE KEYS */;
INSERT INTO `luong_tam_tinh` VALUES (1,4,'2026-05-23',0.75,25000.00,18750.00,'ve_som','Chấm công khuôn mặt (QR Code) | GPS: 9.92002783674841, 106.34692643665149 (±82m) | Đi muộn 53 phút | Về sớm 442 phút | GPS Out: 9.92003683818995, 106.3469336214694 (±84m)','2026-05-23 02:54:02','2026-05-23 03:39:02'),(2,5,'2026-05-23',0.00,25000.00,0.00,'dung_gio','','2026-05-23 03:36:50','2026-05-23 03:38:34'),(6,6,'2026-05-23',0.00,25000.00,0.00,'di_muon','Chấm công khuôn mặt (QR Code) | GPS: 9.92003683818995, 106.3469336214694 (±84m) | Đi muộn 111 phút','2026-05-23 03:51:47','2026-05-23 03:51:47');
/*!40000 ALTER TABLE `luong_tam_tinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mon_an`
--

DROP TABLE IF EXISTS `mon_an`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mon_an` (
  `ma_mon` int NOT NULL AUTO_INCREMENT,
  `ten_mon` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta_chi_tiet` text COLLATE utf8mb4_unicode_ci,
  `gia_tien` decimal(12,2) NOT NULL,
  `dinh_luong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gia_khuyen_mai` decimal(12,2) DEFAULT NULL,
  `so_luong_ton` int DEFAULT '0',
  `don_vi_tinh` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'suất',
  `anh_mon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_danh_muc` int NOT NULL,
  `is_featured` tinyint DEFAULT '0',
  `trang_thai` tinyint DEFAULT '1',
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tu_khoa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo món ăn, dùng để xác định món mới',
  PRIMARY KEY (`ma_mon`),
  KEY `fk_mon_an_danhmuc` (`ma_danh_muc`),
  KEY `idx_mon_an_ngay_tao` (`ngay_tao`),
  CONSTRAINT `fk_mon_an_danhmuc` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mon_an`
--

LOCK TABLES `mon_an` WRITE;
/*!40000 ALTER TABLE `mon_an` DISABLE KEYS */;
INSERT INTO `mon_an` VALUES (1,'Khai vị 4 mùa','Khai vị 4 mùa là món ăn tổng hợp gồm nhiều món nhỏ đặc trưng, kết hợp hài hòa các hương vị chua, cay, mặn, ngọt, mang đến sự phong phú và hấp dẫn ngay từ phần mở đầu bữa tiệc.',200000.00,'',NULL,200,'suất','/images/product-1774344386232-886060676.jpg',3,0,1,'2026-05-19 09:37:26','','2026-06-19 00:14:18'),(2,'Lẩu Cù Lao','Lẩu cù lao là món lẩu truyền thống với nồi lẩu dạng tháp độc đáo, nước dùng ngọt thanh từ xương hầm, kết hợp đa dạng nguyên liệu như tôm, mực, thịt, rau… tạo nên hương vị đậm đà, thích hợp cho những bữa ăn sum họp.',200000.00,'',NULL,47,'suất','/images/product-1774344298299-192997070.webp',1,0,1,'2026-05-19 09:37:23','lẩu','2026-06-19 00:14:18'),(3,'Cá tai tượng chiên xù','Cá tai tượng chiên xù là món ăn hấp dẫn với cá chiên vàng giòn nguyên con, lớp da phồng rụm, thịt bên trong mềm ngọt, thường ăn kèm rau sống và bánh tráng, chấm nước mắm chua ngọt đậm đà.\r\n',250000.00,'',NULL,500,'suất','/images/product-1774344222743-496383409.jpg',1,0,1,'2026-05-19 09:37:18','hải sản','2026-06-19 00:14:18'),(22,'Cà nướng Tây Bắc','Cà nướng Tây Bắc là món dân dã với cà tím nướng than cho mềm thơm, sau đó dầm cùng gia vị như mắc khén, ớt, tỏi, tạo vị cay nhẹ, bùi béo và đậm đà hương núi rừng.',40000.00,'',35000.00,3,'phần','/images/product-1774344028834-540443766.jpg',1,1,1,'2026-05-31 11:14:03','hải sản','2026-06-19 00:14:18'),(23,'Tôm sú sốt mật ong','Tôm sú sốt mật ong là món ăn hấp dẫn với tôm sú tươi chắc thịt, được áo lớp sốt mật ong óng vàng, vị ngọt dịu hòa quyện cùng chút mặn và thơm nhẹ, tạo nên hương vị đậm đà, dễ ăn và bắt mắt.\r\n',100000.00,'',NULL,25,'suất','/images/product-1774343741428-137109798.jpg',3,0,1,'2026-05-19 09:37:01','cay,hải sản','2026-06-19 00:14:18'),(24,'Gỏi bò bóp thấu','',300000.00,'',NULL,49,'suất','/images/product-1777441205707-601730544.jpg',1,0,1,'2026-05-18 09:34:39','thịt bò','2026-06-19 00:14:18'),(25,'Gỏi bò Phương Nam','',250000.00,'',NULL,67,'suất','/images/product-1777445821290-995131813.jpg',1,0,1,'2026-06-08 10:15:09','thịt bò','2026-06-19 00:14:18'),(26,'Gà hấp mắm nhĩ','',300000.00,'',NULL,7,'suất','/images/product-1777444849241-246002053.png',1,0,1,'2026-11-09 22:54:33','thịt gà','2026-06-19 00:14:18'),(27,'Sụn gà chiên nước mắm','',89000.00,'',NULL,33,'suất','/images/product-1777444735169-447092757.jpg',1,0,1,'2026-05-18 09:34:39','thịt gà','2026-06-19 00:14:18'),(28,'Lẩu thác lác khổ qua','',350000.00,'',NULL,32,'suất','/images/product-1777444989573-744515064.jpg',1,0,1,'2026-05-18 09:34:39','lẩu','2026-06-19 00:14:18'),(29,'Khô lù đù 1 nắng','',99000.00,'',NULL,15,'suất','/images/product-1777445543269-936027579.jpg',4,0,1,'2026-06-18 22:51:36','','2026-06-19 00:14:18'),(30,'Trứng chiên hành','',55000.00,'',NULL,40,'suất','/images/product-1777445871515-963127602.jpg',1,0,1,'2026-04-29 13:59:52','','2026-06-19 00:14:18'),(31,'Bò né','',200000.00,'',NULL,40,'suất','/images/product-1777446394038-506039207.jpg',1,0,1,'2026-05-18 09:34:39','thịt bò','2026-06-19 00:14:18'),(32,'Tôm nướng muối ','Tôm được làm sạch, ướp với hỗn hợp muối, ớt, tỏi và gia vị rồi đem nướng trên than hồng. Khi chín, vỏ tôm chuyển màu đỏ cam hấp dẫn, dậy mùi thơm. Khi ăn, có vị:\r\n\r\nNgọt từ thịt tôm\r\nMặn cay từ muối ớt\r\nThơm từ tỏi và quá trình nướng\r\n\r\nThường ăn kèm:\r\n\r\nMuối tiêu chanh hoặc muối ớt xanh\r\nRau răm, dưa leo\r\nCó thể ăn với bánh tráng',150000.00,'',NULL,16,'suất','/images/product-1777686392257-270930649.jpg',1,0,1,'2026-05-18 09:34:39','hải sản','2026-06-19 00:14:18'),(33,'Cơm chiên tỏi trứng','Cơm chiên tỏi trứng là món ăn đơn giản nhưng rất “bắt vị”. Hạt cơm tơi, săn, được đảo cùng tỏi phi vàng thơm lừng, trứng béo nhẹ. Khi ăn có:\r\n\r\nMùi thơm đặc trưng của tỏi phi\r\nVị béo từ trứng\r\nĐậm đà nhờ nước mắm/ gia vị\r\nHạt cơm không dính, khô ráo\r\n\r\nMón này thường ăn kèm: dưa leo, cà chua, tương ớt hoặc nước mắm.',99000.00,'',NULL,32,'suất','/images/product-1777686609418-358926490.jpg',1,0,1,'2026-06-18 22:51:36','','2026-06-19 00:14:18'),(34,'Tôm xào bông mướp','Tôm xào bông mướp là món ăn dân dã, thanh nhẹ nhưng rất ngon. Tôm ngọt tự nhiên kết hợp với bông mướp mềm, hơi nhớt nhẹ đặc trưng. Món này có:\r\n\r\nVị ngọt thanh từ tôm và bông mướp\r\nMùi thơm nhẹ của tỏi phi\r\nKết cấu mềm – giòn nhẹ, không ngấy',150000.00,'',NULL,15,'suất','/images/product-1777687278748-276876729.jpg',1,0,1,'2026-05-18 09:34:39','hải sản,thịt bò','2026-06-19 00:14:18'),(35,'Đồ nguội mâm tiệc','',299000.00,'',NULL,5,'suất','/images/product-1777687885169-620108070.jpg',3,0,1,'2026-05-02 09:15:42','','2026-06-19 00:14:18'),(36,'Mực trứng chiên nước mắm','Đây là món rất “bắt cơm” và dễ bán. Mực trứng giòn bên ngoài, bên trong béo nhẹ phần trứng, áo lớp nước mắm tỏi ớt đậm đà. Khi ăn có:\r\n\r\nGiòn nhẹ bên ngoài – mềm bên trong\r\nVị mặn ngọt hài hòa\r\nMùi thơm của tỏi phi + nước mắm',199000.00,'',NULL,12,'suất','/images/product-1777689041264-939010400.jpg',1,0,1,'2026-06-18 22:51:36','hải sản','2026-06-19 00:14:18'),(37,'Gỏi gà măng cục','Gỏi gà măng cụt là món ăn kết hợp giữa thịt gà xé mềm ngọt và măng cụt xanh giòn mát, trộn cùng rau thơm và nước mắm chua ngọt. Món ăn có hương vị thanh mát, hấp dẫn và đặc trưng của ẩm thực miền Nam.\r\n',350000.00,'',NULL,23,'suất','/images/product-1781793997668-174004838.jpg',1,0,1,'2026-11-09 22:54:33','','2026-06-19 00:14:18'),(38,'Bia Corona','',38000.00,'',NULL,9,'suất','/images/product-1781795526413-773980378.jpg',2,0,1,'2026-06-19 12:13:28','','2026-06-19 00:14:18'),(44,'Lẩu cá ','',300000.00,'',NULL,19,'suất','/images/product-1781844733724-63004693.jpg',1,0,1,'2026-07-07 07:38:31','','2026-06-19 11:52:13'),(45,'Tôm sốt thái','Tôm sốt Thái là món ăn hấp dẫn với những con tôm tươi giòn được hòa quyện trong nước sốt Thái chua cay đậm đà. Vị chua thanh của chanh, cay nồng của ớt, thơm nhẹ của tỏi cùng vị ngọt tự nhiên từ tôm tạo nên hương vị hài hòa, kích thích vị giác. Món ăn thường được dùng kèm rau thơm, hành tím và các loại rau củ tươi, mang đến cảm giác tươi mát và hấp dẫn.\r\n',99000.00,'',NULL,14,'suất','/images/product-1781844877334-80445892.jpg',1,0,1,'2026-06-19 11:55:47','','2026-06-19 11:54:37'),(46,'Đậu hủ sốc rau râm','Đậu hủ sốt rau răm là món ăn dân dã với đậu hũ chiên vàng giòn bên ngoài, mềm béo bên trong, hòa quyện cùng nước sốt đậm đà thơm lừng rau răm. Vị béo của đậu hũ kết hợp vị cay nhẹ, thơm đặc trưng của rau răm tạo nên hương vị hấp dẫn, đưa cơm. ?️✨\r\n',59000.00,'',NULL,4,'suất','/images/product-1781925044473-505324109.jpg',3,0,1,'2026-11-09 22:54:33','','2026-06-20 10:10:44'),(47,'Gà hấp rượu','Gà hấp rượu là món ăn thơm ngon với thịt gà mềm ngọt, được hấp cùng rượu và các loại gia vị truyền thống, tạo nên hương thơm đặc trưng hấp dẫn. Thịt gà giữ được độ mọng nước, đậm đà, thích hợp dùng kèm muối tiêu chanh hoặc rau sống. ?✨\r\n',450000.00,'',NULL,7,'suất','/images/product-1781925438531-384366802.jpg',1,0,1,'2026-11-09 22:54:33','','2026-06-20 10:17:18'),(48,'Cơm chiên heo quay','Cơm chiên heo quay là món ăn hấp dẫn với hạt cơm vàng tơi được chiên thơm cùng trứng, rau củ và những miếng heo quay giòn rụm. Sự hòa quyện giữa vị béo thơm của heo quay và cơm chiên đậm đà tạo nên hương vị ngon miệng, thích hợp cho mọi bữa ăn. ??✨\r\n',99000.00,'',NULL,15,'suất','/images/product-1781927638675-928798114.jpg',1,0,1,'2026-11-09 22:54:33','','2026-06-20 10:53:58'),(49,'Canh bồ ngót','**Canh bồ ngót** là món canh thanh mát, được nấu từ lá bồ ngót tươi kết hợp với thịt băm hoặc tôm, có vị ngọt tự nhiên, nước dùng trong, giàu vitamin và chất xơ. Món ăn giúp giải nhiệt, dễ tiêu hóa và phù hợp cho bữa cơm gia đình hằng ngày.\r\n',99000.00,'',NULL,12,'suất','/images/product-1783133055619-68012710.jpg',1,0,1,'2026-07-04 09:44:33','','2026-07-04 09:44:15');
/*!40000 ALTER TABLE `mon_an` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mon_an_embedding`
--

DROP TABLE IF EXISTS `mon_an_embedding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mon_an_embedding` (
  `ma_mon` int NOT NULL,
  `vector` json NOT NULL,
  PRIMARY KEY (`ma_mon`),
  CONSTRAINT `fk_emb_mon` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mon_an_embedding`
--

LOCK TABLES `mon_an_embedding` WRITE;
/*!40000 ALTER TABLE `mon_an_embedding` DISABLE KEYS */;
/*!40000 ALTER TABLE `mon_an_embedding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mon_an_khau_vi`
--

DROP TABLE IF EXISTS `mon_an_khau_vi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mon_an_khau_vi` (
  `ma_mon` int NOT NULL,
  `id_thuoc_tinh` int NOT NULL,
  PRIMARY KEY (`ma_mon`,`id_thuoc_tinh`),
  KEY `id_thuoc_tinh` (`id_thuoc_tinh`),
  CONSTRAINT `mon_an_khau_vi_ibfk_1` FOREIGN KEY (`ma_mon`) REFERENCES `mon_an` (`ma_mon`) ON DELETE CASCADE,
  CONSTRAINT `mon_an_khau_vi_ibfk_2` FOREIGN KEY (`id_thuoc_tinh`) REFERENCES `thuoc_tinh_khau_vi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mon_an_khau_vi`
--

LOCK TABLES `mon_an_khau_vi` WRITE;
/*!40000 ALTER TABLE `mon_an_khau_vi` DISABLE KEYS */;
INSERT INTO `mon_an_khau_vi` VALUES (23,1),(44,1),(45,1),(24,2),(25,2),(27,3),(33,3),(36,3),(1,6),(2,6),(22,6),(28,6),(34,6),(35,6),(37,6),(46,6),(49,6),(24,7),(25,7),(26,7),(27,7),(31,7),(33,7),(37,7),(47,7),(3,8),(23,8),(29,8),(32,8),(34,8),(36,8),(44,8),(45,8),(33,9),(48,9),(38,10);
/*!40000 ALTER TABLE `mon_an_khau_vi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `muc_tieu_chi_tiet`
--

DROP TABLE IF EXISTS `muc_tieu_chi_tiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `muc_tieu_chi_tiet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thang` int NOT NULL,
  `nam` int NOT NULL,
  `loai_muc_tieu` enum('doanh_thu','don_hang','khach_hang_moi','dat_ban','danh_gia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_muc_tieu` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `gia_tri_muc_tieu` decimal(15,2) NOT NULL DEFAULT '0.00',
  `gia_tri_hien_tai` decimal(15,2) NOT NULL DEFAULT '0.00',
  `don_vi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'đơn vị',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 0xF09F8EAF,
  `thu_tu` int DEFAULT '1',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `thang_nam_loai` (`thang`,`nam`,`loai_muc_tieu`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `muc_tieu_chi_tiet`
--

LOCK TABLES `muc_tieu_chi_tiet` WRITE;
/*!40000 ALTER TABLE `muc_tieu_chi_tiet` DISABLE KEYS */;
INSERT INTO `muc_tieu_chi_tiet` VALUES (16,12,2025,'doanh_thu','Doanh thu tháng','Tăng 10% so với tháng trước (390.000đ)',400000.00,0.00,'đồng','?',1,'2025-12-07 13:35:29','2025-12-07 13:35:29'),(17,12,2025,'don_hang','Số đơn hàng','Tăng 10% so với tháng trước (59 đơn)',65.00,0.00,'đơn','?',2,'2025-12-07 13:35:29','2025-12-07 13:35:29'),(18,12,2025,'khach_hang_moi','Khách hàng mới','Tăng 15% so với tháng trước (6 khách)',7.00,0.00,'người','?',3,'2025-12-07 13:35:29','2025-12-07 13:35:29'),(19,12,2025,'dat_ban','Lượt đặt bàn','Mục tiêu đặt bàn cho quán',5.00,0.00,'lượt','?️',4,'2025-12-07 13:35:29','2025-12-07 13:35:29'),(20,12,2025,'danh_gia','Đánh giá tích cực','Tăng 20% so với tháng trước (4 đánh giá)',5.00,0.00,'đánh giá','⭐',5,'2025-12-07 13:35:29','2025-12-07 13:35:29');
/*!40000 ALTER TABLE `muc_tieu_chi_tiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `muc_tieu_thang`
--

DROP TABLE IF EXISTS `muc_tieu_thang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `muc_tieu_thang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `thang` int NOT NULL,
  `nam` int NOT NULL,
  `muc_tieu_doanh_thu` decimal(15,2) NOT NULL DEFAULT '0.00',
  `muc_tieu_don_hang` int NOT NULL DEFAULT '0',
  `muc_tieu_khach_hang` int DEFAULT '0',
  `muc_tieu_dat_ban` int DEFAULT '0',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `thang_nam` (`thang`,`nam`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `muc_tieu_thang`
--

LOCK TABLES `muc_tieu_thang` WRITE;
/*!40000 ALTER TABLE `muc_tieu_thang` DISABLE KEYS */;
INSERT INTO `muc_tieu_thang` VALUES (1,12,2025,50000000.00,100,0,0,'Mục tiêu tháng 12 - Mùa lễ hội','2025-12-06 16:08:44','2025-12-06 16:08:44');
/*!40000 ALTER TABLE `muc_tieu_thang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoi_dung`
--

DROP TABLE IF EXISTS `nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoi_dung` (
  `ma_nguoi_dung` int NOT NULL AUTO_INCREMENT,
  `ten_nguoi_dung` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mat_khau_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gioi_tinh` enum('khac','nam','nu') COLLATE utf8mb4_unicode_ci DEFAULT 'khac',
  `anh_dai_dien` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` tinyint DEFAULT '1',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nguoi_dung`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoi_dung`
--

LOCK TABLES `nguoi_dung` WRITE;
/*!40000 ALTER TABLE `nguoi_dung` DISABLE KEYS */;
INSERT INTO `nguoi_dung` VALUES (1,'Nguyễn Văn A','vana@gmail.com','0901234567',NULL,'123 Quận 1, HCM','nam',NULL,NULL,1,'2026-03-23 08:58:24'),(2,'Trần Thị B','thib@gmail.com','0907654321',NULL,'456 Quận 3, HCM','nu',NULL,NULL,1,'2026-03-23 08:58:24'),(3,'Thuật Thuật','nguyenhuynhkithuat84tv@gmail.com','','google_oauth','Trà Cú ','nam','https://lh3.googleusercontent.com/a/ACg8ocIo90HHFVO_TpBzGlbr-kcFij7f4VyqjWwWZYUSGqJIjRzSHp85=s200-c','102458705850277446461',1,'2026-03-24 13:38:36'),(4,'Thiên Vũ Đỗ','dothienvu84tv@gmail.com',NULL,NULL,NULL,'khac','https://lh3.googleusercontent.com/a/ACg8ocJtGsRrsTVGZKZl9h9Ug3fZgeVQ9O8hVafBB1jaWnRpKAW6rA=s200-c','105227688268935859438',1,'2026-03-24 15:52:46'),(5,'celras tvu','congnghephanmem71@gmail.com',NULL,NULL,NULL,'khac','https://lh3.googleusercontent.com/a/ACg8ocK81PcCNcbBJHq6iebDUDVmfCAcEoY_uzENb-1Vf_bXF0B6dfs=s200-c','102705747073276246926',1,'2026-04-18 09:45:00'),(6,'thaovy dichvudulich','dichvudulichthaovy@gmail.com',NULL,NULL,NULL,'khac','https://lh3.googleusercontent.com/a/ACg8ocK5Cy-qE64VFAgZ08WwYIhfs9q6hwACGxQYMV7uhPLwjdPO_g=s200-c','114516165245501102433',1,'2026-04-22 16:35:13'),(7,'Đỗ Thiên Vũ','dothienvu@gmail.com','0912345678','$2b$10$7R1pXU0e2qfI2R6N1m8tUuD22l7W2y9w6O2X3i8tUuA5v6w6y2y2y',NULL,'khac',NULL,NULL,1,'2026-05-19 11:17:14'),(8,'Hân Trần Thị Ngọc','hantranthingoc359@gmail.com',NULL,NULL,NULL,'khac','https://lh3.googleusercontent.com/a/ACg8ocLCb7n4ZYOB5oB2Hw-txYE8TIa4wZE4Z6i4xCsk6S6-UyJSmQ=s200-c','113236059666256918063',1,'2026-05-31 11:53:30');
/*!40000 ALTER TABLE `nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguyen_lieu`
--

DROP TABLE IF EXISTS `nguyen_lieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguyen_lieu` (
  `ma_nguyen_lieu` int NOT NULL AUTO_INCREMENT,
  `ten_nguyen_lieu` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_luong_ton` decimal(10,2) NOT NULL DEFAULT '0.00',
  `don_vi_tinh` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Gram, Kg, Lít, ML, Cái, Bịch...',
  `don_vi_tu_nhien` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đơn vị tự nhiên: con, quả, trái...',
  `trong_luong_trung_binh` decimal(10,2) DEFAULT NULL COMMENT 'Trọng lượng TB: 1 con = ? gram',
  `don_vi_chuan` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'g' COMMENT 'Đơn vị chuẩn lưu trữ: g hoặc ml',
  `don_vi_nhap` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ti_le_chuyen_doi` decimal(10,2) DEFAULT '1.00',
  `muc_canh_bao` decimal(10,2) NOT NULL DEFAULT '1000.00' COMMENT 'Cảnh báo khi thấp hơn mức này',
  `trang_thai` tinyint DEFAULT '1',
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ma_nha_cung_cap` int DEFAULT NULL,
  `gia_nhap_gan_nhat` decimal(12,2) DEFAULT '0.00',
  `ma_loai_nglieu` int DEFAULT NULL,
  PRIMARY KEY (`ma_nguyen_lieu`),
  UNIQUE KEY `ten_nguyen_lieu` (`ten_nguyen_lieu`),
  KEY `fk_nguyen_lieu_ncc` (`ma_nha_cung_cap`),
  KEY `ma_loai_nglieu` (`ma_loai_nglieu`),
  KEY `idx_natural_unit` (`don_vi_tu_nhien`),
  KEY `idx_low_stock` (`so_luong_ton`,`muc_canh_bao`),
  CONSTRAINT `fk_nguyen_lieu_ncc` FOREIGN KEY (`ma_nha_cung_cap`) REFERENCES `nha_cung_cap` (`ma_nha_cung_cap`) ON DELETE SET NULL,
  CONSTRAINT `nguyen_lieu_ibfk_1` FOREIGN KEY (`ma_loai_nglieu`) REFERENCES `loai_nguyen_lieu` (`ma_loai_nglieu`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguyen_lieu`
--

LOCK TABLES `nguyen_lieu` WRITE;
/*!40000 ALTER TABLE `nguyen_lieu` DISABLE KEYS */;
INSERT INTO `nguyen_lieu` VALUES (5,'Tôm sú',2800.00,'g','con',20.00,'g','kg',1000.00,2000.00,1,'2026-04-18 10:47:23',NULL,0.00,5),(7,'Cà tím',7.00,'cai',NULL,NULL,'g','cai',1.00,1.00,1,'2026-05-18 10:41:53',NULL,0.00,2),(8,'Thịt bầm',9300.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-05-18 10:41:53',NULL,0.00,6),(9,'Tôm thẻ',5000.00,'g','con',33.33,'g','kg',1000.00,1000.00,1,'2026-04-29 13:58:40',NULL,0.00,5),(10,'Bia Tiger bạc lon lùn',120.00,'cai',NULL,NULL,'g','thung',24.00,24.00,1,'2026-04-29 12:31:13',NULL,0.00,1),(11,'Nấm đùi gà',5000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-03-30 15:46:00',NULL,0.00,2),(12,'Mật ong',5000.00,'ml',NULL,NULL,'g','l',1000.00,1000.00,1,'2026-04-18 10:20:14',NULL,0.00,4),(13,'Thịt bò',26400.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-06-07 13:35:53',NULL,0.00,6),(14,'Hành tây',9920.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-05-13 09:39:10',NULL,0.00,2),(15,'Cà rốt',5000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 12:19:58',NULL,0.00,2),(18,'Đậu phộng',5000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 12:34:45',NULL,0.00,4),(19,'Hành phi',9000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 12:35:14',NULL,0.00,4),(20,'Chuối chát',5850.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-06-07 13:35:53',NULL,0.00,2),(21,'Bún gạo khô',6700.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-06-07 13:35:53',NULL,0.00,4),(22,'Gà',7000.00,'g','con',1000.00,'g','kg',1000.00,1000.00,1,'2026-11-09 22:54:33',NULL,0.00,6),(23,'Sụn gà',10000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 13:38:04',NULL,0.00,6),(24,'Khổ qua',8000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 13:44:01',NULL,0.00,2),(25,'Chả cá thác lác',13000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 13:44:23',NULL,0.00,5),(26,'Khô cá lù đù',4700.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-06-08 10:38:53',NULL,0.00,5),(27,'Trứng',200.00,'cai',NULL,NULL,'g','cai',1.00,20.00,1,'2026-04-29 13:59:01',NULL,0.00,4),(28,'Hành lá',6000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 13:59:21',NULL,0.00,2),(29,'Bông bí',4000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 14:02:31',NULL,0.00,2),(30,'Thiên lý',5000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-04-29 14:02:57',NULL,0.00,2),(31,'Cơm trắng',9700.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-06-08 10:15:28',NULL,0.00,3),(32,'Bông mướp',3000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-05-02 09:01:38',NULL,0.00,2),(33,'Chả giỏ (siêu thị)',50.00,'cai',NULL,NULL,'g','cai',1.00,10.00,1,'2026-05-02 09:13:57',NULL,0.00,3),(34,'Bánh phồng',50.00,'cai',NULL,NULL,'g','cai',1.00,12.00,1,'2026-05-02 09:14:23',NULL,0.00,3),(35,'Bò lá lốt (siêu thị)',50.00,'cai',NULL,NULL,'g','cai',1.00,10.00,1,'2026-05-02 09:15:18',NULL,0.00,3),(36,'Mực trứng ',3800.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-05-13 09:39:10',NULL,0.00,5),(37,'Măng cục',5000.00,'g','',NULL,'g','kg',1000.00,1000.00,1,'2026-06-18 21:47:14',NULL,0.00,2),(38,'Bia Corona',216.00,'cai',NULL,NULL,'g','thung',24.00,24.00,1,'2026-06-18 22:51:36',NULL,0.00,1),(39,'Cá hú',5700.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-06-19 12:13:28',NULL,0.00,5),(40,'Đậu hủ',8.00,'cai',NULL,NULL,'g','cai',1.00,5.00,1,'2026-11-09 22:54:33',NULL,0.00,3),(41,'Thịt heo',5700.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-11-09 22:54:33',NULL,0.00,6),(42,'Cơm',4700.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-11-09 22:54:33',NULL,0.00,3),(43,'bồ ngót',6000.00,'g',NULL,NULL,'g','kg',1000.00,1000.00,1,'2026-07-04 09:43:15',NULL,0.00,2);
/*!40000 ALTER TABLE `nguyen_lieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nha_cung_cap`
--

DROP TABLE IF EXISTS `nha_cung_cap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nha_cung_cap` (
  `ma_nha_cung_cap` int NOT NULL AUTO_INCREMENT,
  `ten_nha_cung_cap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` text COLLATE utf8mb4_unicode_ci,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` enum('dang_hop_tac','ngung_hop_tac') COLLATE utf8mb4_unicode_ci DEFAULT 'dang_hop_tac',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `thoi_gian_cap_nhat` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nha_cung_cap`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nha_cung_cap`
--

LOCK TABLES `nha_cung_cap` WRITE;
/*!40000 ALTER TABLE `nha_cung_cap` DISABLE KEYS */;
INSERT INTO `nha_cung_cap` VALUES (1,'Đại lý Thực phẩm Sạch Việt','0901234567',NULL,'123 Đường ABC, Q1, TP.HCM','Cung cấp sườn, tôm, thịt','dang_hop_tac','2026-03-28 13:19:52','2026-03-30 06:45:28'),(2,'Công ty Nông sản Xanh','0987654321',NULL,'456 Đường XYZ, Q.Bình Tân, TP.HCM','Cung cấp bún, gạo, rau','dang_hop_tac','2026-03-28 13:19:52','2026-03-30 06:45:28'),(3,'Nhà phân phối Cà phê Cao Nguyên','0912345678',NULL,'789 Đường LMN, Q3, TP.HCM','Cung cấp cà phê rang xay','dang_hop_tac','2026-03-28 13:19:52','2026-03-30 06:45:28'),(4,'Đại lý Thực phẩm Sạch Việt','0901234567','','123 Đường ABC, Q1, TP.HCM','Cung cấp sườn, tôm, thịt.\n','dang_hop_tac','2026-03-28 13:38:44','2026-03-30 06:53:09'),(5,'Công ty Nông sản Xanh','0987654321',NULL,'456 Đường XYZ, Q.Bình Tân, TP.HCM','Cung cấp bún, gạo, rau','dang_hop_tac','2026-03-28 13:38:44','2026-03-30 06:45:28'),(6,'Nhà phân phối Cà phê Cao Nguyên','0912345678',NULL,'789 Đường LMN, Q3, TP.HCM','Cung cấp cà phê rang xay','dang_hop_tac','2026-03-28 13:38:44','2026-03-30 06:45:28'),(7,'Đại lý Bia Nguyễn kim','0901234567','','Võ Văn Kiệt, P1, TPTV','','dang_hop_tac','2026-03-30 14:39:30','2026-03-30 07:39:30');
/*!40000 ALTER TABLE `nha_cung_cap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien`
--

DROP TABLE IF EXISTS `nhan_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien` (
  `ma_nhan_vien` int NOT NULL AUTO_INCREMENT,
  `ma_nv_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten_nhan_vien` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anh_dai_dien` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tai_khoan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mat_khau_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` text COLLATE utf8mb4_unicode_ci,
  `ngay_sinh` date DEFAULT NULL,
  `gioi_tinh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cccd` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anh_cccd` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anh_cccd_sau` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `luong_co_ban` decimal(14,2) DEFAULT '0.00',
  `luong_theo_gio` decimal(14,2) DEFAULT '0.00',
  `vai_tro` enum('admin','manager','cashier','waiter','chef','staff') COLLATE utf8mb4_unicode_ci DEFAULT 'waiter',
  `vai_tro_id` int DEFAULT NULL,
  `trang_thai` tinyint DEFAULT '1' COMMENT '1: hoạt động, 0: khóa',
  `is_deleted` tinyint(1) DEFAULT '0',
  `ngay_vao_lam` date DEFAULT (curdate()),
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nhan_vien`),
  UNIQUE KEY `tai_khoan` (`tai_khoan`),
  KEY `fk_nhanvien_role` (`vai_tro_id`),
  CONSTRAINT `fk_nhanvien_role` FOREIGN KEY (`vai_tro_id`) REFERENCES `vai_tro_he_thong` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien`
--

LOCK TABLES `nhan_vien` WRITE;
/*!40000 ALTER TABLE `nhan_vien` DISABLE KEYS */;
INSERT INTO `nhan_vien` VALUES (1,'NV001','Quản lý',NULL,'admin','$2a$10$RqSKPhZuoHQK7vcXn8YsZ.GV5o9rRVpVFk7IzQhRShzXCxgeKFpbC',NULL,NULL,NULL,NULL,NULL,NULL,NULL,15000000.00,0.00,'manager',NULL,0,0,'2026-03-29','2026-03-25 08:27:29','2026-05-22 11:57:45'),(2,'NV002','Nguyễn Văn A',NULL,'nhanvien1','$2a$10$q3P908OACkk1poj9crlvGuiMaJn5NiDU2as/S8RssBhoOxRVx7YXe','0901234567',NULL,NULL,NULL,NULL,NULL,NULL,5000000.00,25000.00,'staff',NULL,0,0,'2026-03-29','2026-03-25 08:27:29','2026-05-22 11:57:45'),(3,'NV003','Hoàng Quân ',NULL,'letv2','$2a$10$mmUyU9xK4EX87W51qJzIYuUjtxvrl.JW06Ij8uuYkbr066V02SpzG','0388853044','',NULL,'Nam','084204005959',NULL,NULL,3000000.00,0.00,'waiter',NULL,1,0,'2026-03-29','2026-03-25 08:31:34','2026-05-22 11:57:45'),(4,'NV004','Nguyễn Huỳnh Kỹ Thuật','/uploads/staff/crop-1779504687-9517.jpg','KyThuat84','$2a$10$gLMS.lVkkxy2ySTf7VVp/eq2JHn4WmBxLn2penMezqDWkVf1cLPNS','0388853046','','2004-03-16','Nam',NULL,'/uploads/staff/staff-1774925328855-490490667.jpg','/uploads/staff/staff-1774925332358-669071351.jpg',0.00,25000.00,'manager',NULL,1,0,'2026-03-29','2026-03-25 09:33:24','2026-05-23 09:51:29'),(5,'NV005','Đinh Thị Yến Nhi','/uploads/staff/crop-1779507314-6104.jpg','Nhi123','$2a$10$i49PYhN77w.PJUF0rDZXKuwftsoq19BtCy69.d9HfBGS.Pfk0R2sG','0388853040','Vĩnh Long','2004-07-03','Nữ',NULL,'/uploads/staff/staff-1779507286736-386447047.jpg','/uploads/staff/staff-1779507290767-117289816.jpg',0.00,25000.00,'waiter',NULL,1,0,'2026-05-23','2026-05-23 10:35:16','2026-05-23 10:35:16'),(6,'NV006','Hồ Quang Vinh','/uploads/staff/crop-1779508222-2950.jpg','Vinh','$2a$10$l/bDFHOJ1BftxmjLEg2iN.qlWJb2JBYc.LeIBLWn3O8nYzi4e4gUi','0388853048','Cầu Kè Vĩnh Long','2004-08-25','Nam',NULL,'/uploads/staff/staff-1779508178072-587273313.jpg','/uploads/staff/staff-1779508181233-433419206.jpg',0.00,25000.00,'waiter',NULL,1,0,'2026-05-23','2026-05-23 10:50:24','2026-05-23 10:50:24');
/*!40000 ALTER TABLE `nhan_vien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien_quyen`
--

DROP TABLE IF EXISTS `nhan_vien_quyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien_quyen` (
  `ma_quyen` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `xem_don_hang` tinyint(1) DEFAULT '1',
  `tao_don_hang` tinyint(1) DEFAULT '1',
  `sua_don_hang` tinyint(1) DEFAULT '0',
  `xoa_don_hang` tinyint(1) DEFAULT '0',
  `huy_don_hang` tinyint(1) DEFAULT '0',
  `xem_ban` tinyint(1) DEFAULT '1',
  `dat_ban` tinyint(1) DEFAULT '1',
  `sua_ban` tinyint(1) DEFAULT '0',
  `xoa_ban` tinyint(1) DEFAULT '0',
  `xem_menu` tinyint(1) DEFAULT '1',
  `them_menu` tinyint(1) DEFAULT '0',
  `sua_menu` tinyint(1) DEFAULT '0',
  `xoa_menu` tinyint(1) DEFAULT '0',
  `xem_khach_hang` tinyint(1) DEFAULT '0',
  `them_khach_hang` tinyint(1) DEFAULT '0',
  `sua_khach_hang` tinyint(1) DEFAULT '0',
  `xoa_khach_hang` tinyint(1) DEFAULT '0',
  `xem_kho` tinyint(1) DEFAULT '0',
  `them_kho` tinyint(1) DEFAULT '0',
  `sua_kho` tinyint(1) DEFAULT '0',
  `xoa_kho` tinyint(1) DEFAULT '0',
  `nhap_kho` tinyint(1) DEFAULT '0',
  `xuat_kho` tinyint(1) DEFAULT '0',
  `xem_nhan_vien` tinyint(1) DEFAULT '0',
  `them_nhan_vien` tinyint(1) DEFAULT '0',
  `sua_nhan_vien` tinyint(1) DEFAULT '0',
  `xoa_nhan_vien` tinyint(1) DEFAULT '0',
  `phan_quyen` tinyint(1) DEFAULT '0',
  `xem_bao_cao` tinyint(1) DEFAULT '0',
  `xem_doanh_thu` tinyint(1) DEFAULT '0',
  `xem_thong_ke` tinyint(1) DEFAULT '0',
  `xuat_bao_cao` tinyint(1) DEFAULT '0',
  `xem_phieu_bep` tinyint(1) DEFAULT '0',
  `cap_nhat_trang_thai_mon` tinyint(1) DEFAULT '0',
  `xem_cong_thuc` tinyint(1) DEFAULT '0',
  `thanh_toan` tinyint(1) DEFAULT '1',
  `xem_pos` tinyint(1) DEFAULT '1',
  `tao_don_pos` tinyint(1) DEFAULT '1',
  `huy_don_pos` tinyint(1) DEFAULT '0',
  `hoan_tien` tinyint(1) DEFAULT '0',
  `ap_dung_giam_gia` tinyint(1) DEFAULT '0',
  `xem_cai_dat` tinyint(1) DEFAULT '0',
  `sua_cai_dat` tinyint(1) DEFAULT '0',
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_quyen`),
  UNIQUE KEY `unique_staff_permission` (`ma_nhan_vien`),
  CONSTRAINT `nhan_vien_quyen_ibfk_1` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien_quyen`
--

LOCK TABLES `nhan_vien_quyen` WRITE;
/*!40000 ALTER TABLE `nhan_vien_quyen` DISABLE KEYS */;
INSERT INTO `nhan_vien_quyen` VALUES (1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'2026-05-05 05:08:17','2026-05-05 05:14:37'),(2,2,1,1,1,0,0,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0,'2026-05-05 05:08:17','2026-05-05 05:08:17'),(4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,'2026-05-05 05:08:17','2026-05-06 04:27:32'),(5,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,'2026-05-05 05:13:05','2026-05-06 04:45:29'),(6,5,1,1,1,0,0,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0,'2026-05-23 03:35:16','2026-05-23 03:35:16'),(7,6,1,1,1,0,0,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0,'2026-05-23 03:50:24','2026-05-23 03:50:24');
/*!40000 ALTER TABLE `nhan_vien_quyen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_nha_hang`
--

DROP TABLE IF EXISTS `order_nha_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_nha_hang` (
  `ma_order` int NOT NULL AUTO_INCREMENT,
  `ma_ban` int NOT NULL,
  `ma_nhan_vien` int DEFAULT NULL COMMENT 'ID Admin/Nhân viên phục vụ',
  `tong_tien` decimal(14,2) DEFAULT '0.00',
  `trang_thai` enum('dang_phuc_vu','da_thanh_toan','huy') COLLATE utf8mb4_unicode_ci DEFAULT 'dang_phuc_vu',
  `thoi_gian_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_order`),
  KEY `fk_order_ban` (`ma_ban`),
  CONSTRAINT `fk_order_ban` FOREIGN KEY (`ma_ban`) REFERENCES `ban` (`ma_ban`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_nha_hang`
--

LOCK TABLES `order_nha_hang` WRITE;
/*!40000 ALTER TABLE `order_nha_hang` DISABLE KEYS */;
INSERT INTO `order_nha_hang` VALUES (1,2,2,65000.00,'da_thanh_toan','2026-03-23 08:58:24'),(2,3,NULL,400000.00,'da_thanh_toan','2026-03-25 09:09:42'),(3,3,NULL,680000.00,'da_thanh_toan','2026-03-25 09:58:04'),(4,1,NULL,50000.00,'da_thanh_toan','2026-03-25 10:09:08'),(5,1,NULL,100000.00,'da_thanh_toan','2026-03-25 10:11:16'),(6,3,NULL,340000.00,'da_thanh_toan','2026-03-25 10:20:08'),(7,3,NULL,0.00,'huy','2026-03-25 10:52:29'),(8,3,NULL,0.00,'huy','2026-03-25 13:20:38'),(9,1,NULL,270000.00,'da_thanh_toan','2026-03-25 13:35:17'),(10,1,NULL,0.00,'huy','2026-03-25 13:44:31'),(11,3,NULL,40000.00,'da_thanh_toan','2026-03-25 16:23:17'),(15,2,NULL,40000.00,'da_thanh_toan','2026-03-25 16:23:47'),(17,2,NULL,400000.00,'da_thanh_toan','2026-03-27 14:02:33'),(18,1,NULL,200000.00,'da_thanh_toan','2026-03-27 14:08:24'),(19,1,NULL,200000.00,'da_thanh_toan','2026-03-27 15:52:05'),(20,1,NULL,40000.00,'da_thanh_toan','2026-03-27 15:56:25'),(21,6,NULL,490000.00,'dang_phuc_vu','2026-03-28 15:34:15'),(22,1,NULL,608000.00,'dang_phuc_vu','2026-11-09 22:54:33');
/*!40000 ALTER TABLE `order_nha_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset`
--

DROP TABLE IF EXISTS `password_reset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expired_at` datetime NOT NULL,
  `da_su_dung` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_reset_user` (`ma_nguoi_dung`),
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset`
--

LOCK TABLES `password_reset` WRITE;
/*!40000 ALTER TABLE `password_reset` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phan_ca`
--

DROP TABLE IF EXISTS `phan_ca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phan_ca` (
  `ma_phan_ca` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `ma_ca` int NOT NULL,
  `ngay` date NOT NULL,
  `trang_thai` enum('scheduled','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `ghi_chu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_phan_ca`),
  KEY `fk_phanca_nv` (`ma_nhan_vien`),
  KEY `fk_phanca_ca` (`ma_ca`),
  CONSTRAINT `fk_phanca_ca` FOREIGN KEY (`ma_ca`) REFERENCES `ca_lam_viec` (`ma_ca`) ON DELETE CASCADE,
  CONSTRAINT `fk_phanca_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phan_ca`
--

LOCK TABLES `phan_ca` WRITE;
/*!40000 ALTER TABLE `phan_ca` DISABLE KEYS */;
INSERT INTO `phan_ca` VALUES (1,4,6,'2026-03-30','scheduled',NULL),(2,4,6,'2026-03-31','scheduled',NULL),(3,3,5,'2026-03-31','scheduled',NULL),(4,4,5,'2026-04-18','scheduled',NULL),(5,4,4,'2026-05-09','scheduled',NULL),(6,3,5,'2026-05-09','scheduled',NULL),(7,4,4,'2026-05-23','completed',NULL),(8,5,7,'2026-05-23','scheduled',NULL),(9,6,4,'2026-05-23','scheduled',NULL),(10,4,7,'2026-05-31','scheduled',NULL),(12,4,6,'2026-06-05','scheduled',NULL),(13,4,4,'2026-06-03','scheduled',NULL),(14,6,8,'2026-06-08','scheduled',NULL),(15,6,4,'2026-06-12','scheduled',NULL);
/*!40000 ALTER TABLE `phan_ca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_ke_do`
--

DROP TABLE IF EXISTS `phieu_ke_do`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_ke_do` (
  `ma_phieu_ke` int NOT NULL AUTO_INCREMENT,
  `ngay_ke` date NOT NULL,
  `ma_nhan_vien` int DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` enum('cho_duyet','da_duyet','da_nhap') COLLATE utf8mb4_unicode_ci DEFAULT 'cho_duyet',
  `thoi_gian_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_phieu_ke`),
  KEY `fk_phieuke_nv` (`ma_nhan_vien`),
  CONSTRAINT `fk_phieuke_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_ke_do`
--

LOCK TABLES `phieu_ke_do` WRITE;
/*!40000 ALTER TABLE `phieu_ke_do` DISABLE KEYS */;
INSERT INTO `phieu_ke_do` VALUES (1,'2026-03-30',NULL,'','da_duyet','2026-03-30 15:54:17');
/*!40000 ALTER TABLE `phieu_ke_do` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_nhap`
--

DROP TABLE IF EXISTS `phieu_nhap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_nhap` (
  `ma_phieu_nhap` int NOT NULL AUTO_INCREMENT,
  `thoi_gian_nhap` datetime DEFAULT CURRENT_TIMESTAMP,
  `ma_nhan_vien` int DEFAULT NULL,
  `tong_tien` decimal(15,2) DEFAULT '0.00',
  `nha_cung_cap` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'hoan_tat' COMMENT 'cho_duyet, hoan_tat, huy',
  `ma_nha_cung_cap` int DEFAULT NULL,
  PRIMARY KEY (`ma_phieu_nhap`),
  KEY `fk_phieunhap_nhanvien` (`ma_nhan_vien`),
  KEY `fk_phieu_nhap_nha_cung_cap` (`ma_nha_cung_cap`),
  CONSTRAINT `fk_phieu_nhap_nha_cung_cap` FOREIGN KEY (`ma_nha_cung_cap`) REFERENCES `nha_cung_cap` (`ma_nha_cung_cap`),
  CONSTRAINT `fk_phieunhap_nhanvien` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_nhap`
--

LOCK TABLES `phieu_nhap` WRITE;
/*!40000 ALTER TABLE `phieu_nhap` DISABLE KEYS */;
INSERT INTO `phieu_nhap` VALUES (1,'2026-03-30 14:02:35',NULL,5000000.00,'Đại lý Bia Nguyễn kim','','hoan_tat',7),(2,'2026-03-30 14:30:21',NULL,500000.00,'Đại lý Thực phẩm Sạch Việt','','hoan_tat',4),(3,'2026-04-29 12:37:13',NULL,1600000.00,'Đại lý Thực phẩm Sạch Việt','','hoan_tat',1),(4,'2026-04-29 12:38:28',NULL,1600000.00,'Đại lý Thực phẩm Sạch Việt','','hoan_tat',1);
/*!40000 ALTER TABLE `phieu_nhap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preference_tags`
--

DROP TABLE IF EXISTS `preference_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preference_tags` (
  `tag_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_tag` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nhom_tag` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `synonyms` text COLLATE utf8mb4_unicode_ci,
  `affects_recommendation` tinyint(1) NOT NULL DEFAULT '1',
  `trang_thai` tinyint(1) NOT NULL DEFAULT '1',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tag_key`),
  KEY `idx_nhom_tag` (`nhom_tag`),
  KEY `idx_trang_thai` (`trang_thai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preference_tags`
--

LOCK TABLES `preference_tags` WRITE;
/*!40000 ALTER TABLE `preference_tags` DISABLE KEYS */;
INSERT INTO `preference_tags` VALUES ('an_chay','Ăn chay','Ràng buộc','[\"chay\",\"an chay\",\"rau cu\",\"khong thit\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('cay','Cay','Khẩu vị','[\"cay\",\"ot\",\"sa te\",\"cay vua\",\"cay nong\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('chien','Chiên giòn','Loại món','[\"chien\",\"gion\",\"ran\",\"do chien\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('chua','Chua','Khẩu vị','[\"chua\",\"chua ngot\",\"chua cay\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('com_bun_mi','Cơm/Bún/Mì','Loại món','[\"com\",\"bun\",\"mi\",\"pho\",\"hu tieu\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('dam_da','Đậm đà','Khẩu vị','[\"dam da\",\"vua mieng\",\"vua an\",\"nuoc dung\",\"thom ngon\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('do_uong','Đồ uống','Loại món','[\"do uong\",\"tra\",\"ca phe\",\"sinh to\",\"nuoc ep\",\"nuoc ngot\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('gia_tot','Giá tốt','Trải nghiệm','[\"gia tot\",\"gia hop ly\",\"re\",\"dang tien\",\"vua tien\"]',0,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('giao_hang','Giao hàng','Trải nghiệm','[\"giao hang\",\"ship\",\"giao nhanh\",\"dong goi\"]',0,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('hai_san','Hải sản','Nguyên liệu','[\"hai san\",\"tom\",\"muc\",\"lau cua\",\"canh cua\",\"cua dong\",\"cua hoang de\",\"mon cua\",\"ngheu\",\"so\",\"oc\",\"ca kho\",\"ca chien\",\"ca loc\",\"ca\"]',1,1,'2026-05-18 10:19:13','2026-07-04 10:45:01'),('it_ngot','Ít ngọt','Ràng buộc','[\"it ngot\",\"khong ngot\",\"giam ngot\",\"khong duong\",\"it duong\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('khong_cay','Không cay','Ràng buộc','[\"khong cay\",\"it cay\",\"giam cay\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('lau','Lẩu','Loại món','[\"lau\",\"hotpot\",\"nuoc lau\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('man','Mặn','Khẩu vị','[\"man\",\"dam vi\",\"vi man\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('ngot','Ngọt','Khẩu vị','[\"ngot\",\"ngot thanh\",\"ngot vua\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('nuong','Nướng','Loại món','[\"nuong\",\"bbq\",\"do nuong\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('phuc_vu','Phục vụ','Trải nghiệm','[\"phuc vu\",\"nhan vien\",\"thai do\",\"tu van\"]',0,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('rau_nam','Rau nấm','Nguyên liệu','[\"rau\",\"nam\",\"nam tuoi\",\"rau xanh\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('thanh_mat','Thanh mát/ít dầu','Khẩu vị','[\"thanh\",\"thanh mat\",\"it dau\",\"nhe bung\",\"khong dau mo\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('thit_bo','Thịt bò','Nguyên liệu','[\"bo\",\"thit bo\",\"beef\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('thit_ga','Thịt gà','Nguyên liệu','[\"ga\",\"thit ga\",\"chicken\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('trang_mieng','Tráng miệng','Loại món','[\"trang mieng\",\"che\",\"banh\",\"kem\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13'),('tuoi','Tươi','Chất lượng món','[\"tuoi\",\"tuoi ngon\",\"moi\",\"khong tanh\"]',1,1,'2026-05-18 10:19:13','2026-05-18 10:19:13');
/*!40000 ALTER TABLE `preference_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Laptop Dell XPS 13','Laptop cao cấp, màn hình 13 inch, chip Intel Core i7',25000000.00,15,'Laptop','2026-02-12 17:49:17'),(2,'iPhone 14 Pro','Điện thoại thông minh cao cấp từ Apple',28000000.00,20,'Smartphone','2026-02-12 17:49:17'),(3,'Samsung Galaxy S23','Flagship Android với camera tuyệt vời',22000000.00,18,'Smartphone','2026-02-12 17:49:17'),(4,'MacBook Pro M2','Laptop chuyên nghiệp cho sáng tạo nội dung',35000000.00,10,'Laptop','2026-02-12 17:49:17'),(5,'iPad Air','Máy tính bảng đa năng cho công việc và giải trí',15000000.00,25,'Tablet','2026-02-12 17:49:17'),(6,'AirPods Pro','Tai nghe không dây chống ồn chủ động',6000000.00,30,'Phụ kiện','2026-02-12 17:49:17'),(7,'Apple Watch Series 8','Đồng hồ thông minh với nhiều tính năng sức khỏe',10000000.00,12,'Wearable','2026-02-12 17:49:17'),(8,'Sony WH-1000XM5','Tai nghe over-ear chống ồn hàng đầu',9000000.00,15,'Phụ kiện','2026-02-12 17:49:17'),(9,'Samsung 4K Smart TV 55 inch','TV thông minh 4K với màn hình lớn',18000000.00,8,'TV','2026-02-12 17:49:17'),(10,'PlayStation 5','Máy chơi game thế hệ mới',13000000.00,5,'Gaming','2026-02-12 17:49:17');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quang_cao`
--

DROP TABLE IF EXISTS `quang_cao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quang_cao` (
  `ma_quang_cao` int NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hinh_anh` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duong_dan_lien_ket` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vi_tri` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_bat_dau` datetime DEFAULT NULL,
  `ngay_ket_thuc` datetime DEFAULT NULL,
  `trang_thai` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ma_quang_cao`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quang_cao`
--

LOCK TABLES `quang_cao` WRITE;
/*!40000 ALTER TABLE `quang_cao` DISABLE KEYS */;
INSERT INTO `quang_cao` VALUES (1,'Banner Khuyến Mãi Tháng 10','/images/banner-khuyen-mai-10.jpg','/khuyen-mai','homepage-slider','2025-10-01 00:00:00','2025-10-31 23:59:59',1),(2,'Giới thiệu Món Mới','/images/banner-mon-moi.jpg','/menu/mon-moi','homepage-slider','2025-10-01 00:00:00','2025-12-31 23:59:59',1),(3,'Đặt Bàn Trực Tuyến','/images/banner-dat-ban.jpg','/dat-ban','sidebar','2025-01-01 00:00:00','2025-12-31 23:59:59',1),(4,'Chương Trình Thành Viên','/images/banner-thanh-vien.jpg','/thanh-vien','footer','2025-01-01 00:00:00','2025-12-31 23:59:59',1),(5,'Giao Hàng Miễn Phí','/images/banner-freeship.jpg','/chinh-sach-giao-hang','popup','2025-10-01 00:00:00','2025-10-31 23:59:59',1);
/*!40000 ALTER TABLE `quang_cao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quyen_han`
--

DROP TABLE IF EXISTS `quyen_han`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quyen_han` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_quyen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ten_quyen` (`ten_quyen`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quyen_han`
--

LOCK TABLES `quyen_han` WRITE;
/*!40000 ALTER TABLE `quyen_han` DISABLE KEYS */;
INSERT INTO `quyen_han` VALUES (1,'view_dashboard','Xem tổng quan'),(2,'manage_products','Quản lý món ăn & danh mục'),(3,'manage_inventory','Quản lý kho nguyên liệu'),(4,'manage_orders','Quản lý đơn hàng'),(5,'manage_reservations','Quản lý đặt bàn'),(6,'manage_staff','Quản lý nhân sự & lương'),(7,'manage_customers','Quản lý khách hàng'),(8,'manage_settings','Cài đặt hệ thống');
/*!40000 ALTER TABLE `quyen_han` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quyen_vai_tro`
--

DROP TABLE IF EXISTS `quyen_vai_tro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quyen_vai_tro` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_role_perm_perm` (`permission_id`),
  CONSTRAINT `fk_role_perm_perm` FOREIGN KEY (`permission_id`) REFERENCES `quyen_han` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_perm_role` FOREIGN KEY (`role_id`) REFERENCES `vai_tro_he_thong` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quyen_vai_tro`
--

LOCK TABLES `quyen_vai_tro` WRITE;
/*!40000 ALTER TABLE `quyen_vai_tro` DISABLE KEYS */;
INSERT INTO `quyen_vai_tro` VALUES (1,1),(2,1),(1,2),(2,2),(1,3),(2,3),(1,4),(2,4),(1,5),(2,5),(1,6),(1,7),(2,7),(1,8);
/*!40000 ALTER TABLE `quyen_vai_tro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reset_password`
--

DROP TABLE IF EXISTS `reset_password`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reset_password` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expired_at` datetime NOT NULL,
  `da_su_dung` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ma_nguoi_dung` (`ma_nguoi_dung`),
  KEY `token` (`token`),
  CONSTRAINT `reset_password_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reset_password`
--

LOCK TABLES `reset_password` WRITE;
/*!40000 ALTER TABLE `reset_password` DISABLE KEYS */;
INSERT INTO `reset_password` VALUES (1,1,'TOKEN_ABC123XYZ789','2025-10-14 10:30:00',0),(2,2,'TOKEN_DEF456UVW012','2025-10-13 15:45:00',1),(3,3,'TOKEN_GHI789RST345','2025-10-15 09:20:00',0),(4,4,'TOKEN_JKL012OPQ678','2025-10-12 14:00:00',1),(5,5,'TOKEN_MNO345ABC901','2025-10-16 11:30:00',0);
/*!40000 ALTER TABLE `reset_password` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_preference_insights`
--

DROP TABLE IF EXISTS `review_preference_insights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_preference_insights` (
  `ma_insight` int NOT NULL AUTO_INCREMENT,
  `ma_danh_gia` int NOT NULL,
  `ma_nguoi_dung` int NOT NULL,
  `ma_mon` int NOT NULL,
  `tag_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sentiment` enum('positive','negative','neutral') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'neutral',
  `score_delta` decimal(10,2) NOT NULL DEFAULT '0.00',
  `confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
  `evidence` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'review',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_insight`),
  KEY `idx_review` (`ma_danh_gia`),
  KEY `idx_user_tag` (`ma_nguoi_dung`,`tag_key`),
  KEY `idx_tag` (`tag_key`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_preference_insights`
--

LOCK TABLES `review_preference_insights` WRITE;
/*!40000 ALTER TABLE `review_preference_insights` DISABLE KEYS */;
INSERT INTO `review_preference_insights` VALUES (21,1,1,1,'com_bun_mi','positive',3.60,0.85,'com','review','2026-06-18 22:19:26'),(22,1,1,1,'cay','positive',1.65,0.45,'cay','review','2026-06-18 22:19:26'),(23,1,1,1,'ngot','positive',1.65,0.45,'ngot','review','2026-06-18 22:19:26'),(24,1,1,1,'man','positive',1.65,0.45,'man','review','2026-06-18 22:19:26'),(25,1,1,1,'chua','positive',1.65,0.45,'chua, chua cay','review','2026-06-18 22:19:26');
/*!40000 ALTER TABLE `review_preference_insights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `so_thich_khau_vi_nguoi_dung`
--

DROP TABLE IF EXISTS `so_thich_khau_vi_nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `so_thich_khau_vi_nguoi_dung` (
  `ma_nguoi_dung` int NOT NULL,
  `id_thuoc_tinh` int NOT NULL,
  PRIMARY KEY (`ma_nguoi_dung`,`id_thuoc_tinh`),
  KEY `id_thuoc_tinh` (`id_thuoc_tinh`),
  CONSTRAINT `so_thich_khau_vi_nguoi_dung_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `so_thich_khau_vi_nguoi_dung_ibfk_2` FOREIGN KEY (`id_thuoc_tinh`) REFERENCES `thuoc_tinh_khau_vi` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `so_thich_khau_vi_nguoi_dung`
--

LOCK TABLES `so_thich_khau_vi_nguoi_dung` WRITE;
/*!40000 ALTER TABLE `so_thich_khau_vi_nguoi_dung` DISABLE KEYS */;
INSERT INTO `so_thich_khau_vi_nguoi_dung` VALUES (8,1),(3,6),(4,6),(7,6);
/*!40000 ALTER TABLE `so_thich_khau_vi_nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `so_thich_nguoi_dung`
--

DROP TABLE IF EXISTS `so_thich_nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `so_thich_nguoi_dung` (
  `ma_nguoi_dung` int NOT NULL,
  `ma_danh_muc` int NOT NULL,
  PRIMARY KEY (`ma_nguoi_dung`,`ma_danh_muc`),
  KEY `ma_danh_muc` (`ma_danh_muc`),
  CONSTRAINT `so_thich_nguoi_dung_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `so_thich_nguoi_dung_ibfk_2` FOREIGN KEY (`ma_danh_muc`) REFERENCES `danh_muc` (`ma_danh_muc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `so_thich_nguoi_dung`
--

LOCK TABLES `so_thich_nguoi_dung` WRITE;
/*!40000 ALTER TABLE `so_thich_nguoi_dung` DISABLE KEYS */;
INSERT INTO `so_thich_nguoi_dung` VALUES (4,1),(3,3);
/*!40000 ALTER TABLE `so_thich_nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thanh_toan`
--

DROP TABLE IF EXISTS `thanh_toan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thanh_toan` (
  `ma_thanh_toan` int NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int DEFAULT NULL,
  `ma_order_nha_hang` int DEFAULT NULL,
  `so_tien` decimal(14,2) NOT NULL,
  `phuong_thuc` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'momo, vnpay, cash...',
  `ma_giao_dich` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` enum('pending','success','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `thoi_gian_thanh_toan` datetime DEFAULT NULL,
  `thong_tin_them` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ma_thanh_toan`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thanh_toan`
--

LOCK TABLES `thanh_toan` WRITE;
/*!40000 ALTER TABLE `thanh_toan` DISABLE KEYS */;
INSERT INTO `thanh_toan` VALUES (1,2,NULL,220000.00,'cash',NULL,'success','2026-03-25 07:51:32',NULL),(2,NULL,2,400000.00,'cash',NULL,'success','2026-03-25 09:56:18',NULL),(3,NULL,3,680000.00,'cash',NULL,'success','2026-03-25 09:58:14',NULL),(4,NULL,4,50000.00,'cash',NULL,'success','2026-03-25 10:18:46',NULL),(5,NULL,6,340000.00,'cash',NULL,'success','2026-03-25 10:23:08',NULL),(6,3,1,65000.00,'cash',NULL,'success','2026-03-25 10:52:07',NULL),(7,4,5,100000.00,'cash',NULL,'success','2026-03-25 13:29:04',NULL),(8,5,9,270000.00,'cash',NULL,'success','2026-03-25 13:35:35',NULL),(9,6,11,40000.00,'cash',NULL,'success','2026-03-25 16:26:47',NULL),(10,7,15,40000.00,'cash',NULL,'success','2026-03-25 16:33:33',NULL),(11,8,18,200000.00,'cash',NULL,'success','2026-03-27 15:44:06',NULL),(12,9,17,400000.00,'cash',NULL,'success','2026-03-27 15:48:50',NULL),(13,10,19,200000.00,'cash',NULL,'success','2026-03-27 15:52:20',NULL),(14,11,20,40000.00,'cash',NULL,'success','2026-03-27 15:56:31',NULL),(15,12,NULL,200000.00,'momo_demo',NULL,'pending',NULL,NULL),(16,13,NULL,250000.00,'momo','13_1776852222231','pending',NULL,NULL),(17,14,NULL,250000.00,'momo','14_1776852264290','success','2026-04-22 17:05:27','{\"transId\":\"4725528981\",\"payType\":\"napas\",\"message\":\"Successful.\"}'),(18,15,NULL,250000.00,'cod',NULL,'pending',NULL,NULL),(19,16,NULL,200000.00,'momo','16_1776916940461','success','2026-04-23 11:03:17','{\"transId\":\"4726317551\",\"payType\":\"napas\",\"message\":\"Successful.\"}'),(20,17,NULL,199000.00,'momo','17_1777698953162','pending',NULL,NULL),(21,19,NULL,199000.00,'momo','19_1777699841499','pending',NULL,NULL),(22,20,NULL,199000.00,'bank',NULL,'pending',NULL,NULL),(23,21,NULL,199000.00,'momo','21_1778640004267','success','2026-05-13 09:45:46','{\"transId\":\"4744879891\",\"payType\":\"napas\",\"message\":\"Successful.\"}'),(24,23,NULL,280000.00,'momo','23_1779075765919','pending',NULL,NULL),(25,27,NULL,250000.00,'momo','27_1780200896175','pending',NULL,NULL),(26,28,NULL,250000.00,'momo','28_1780813902148','pending',NULL,NULL),(27,29,NULL,250000.00,'momo_demo',NULL,'pending',NULL,NULL),(28,31,NULL,129000.00,'cod',NULL,'success','2026-06-08 10:31:35',NULL),(29,32,NULL,129000.00,'cod',NULL,'success','2026-06-08 10:40:04',NULL),(30,33,NULL,68000.00,'cod',NULL,'success','2026-07-03 21:43:45',NULL),(31,34,NULL,300000.00,'cod',NULL,'success','2026-06-19 12:15:03',NULL),(32,75,NULL,450000.00,'cod',NULL,'success','2026-07-07 07:41:08',NULL);
/*!40000 ALTER TABLE `thanh_toan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thanh_toan_dat_ban`
--

DROP TABLE IF EXISTS `thanh_toan_dat_ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thanh_toan_dat_ban` (
  `ma_thanh_toan` int NOT NULL AUTO_INCREMENT,
  `ma_dat_ban` int NOT NULL,
  `ma_giao_dich` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_tien` decimal(14,2) NOT NULL,
  `noi_dung_chuyen_khoan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trang_thai` enum('pending','paid','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `thoi_gian_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `thoi_gian_thanh_toan` datetime DEFAULT NULL,
  `thoi_gian_het_han` datetime NOT NULL,
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`ma_thanh_toan`),
  UNIQUE KEY `unique_transaction` (`ma_giao_dich`),
  KEY `idx_ma_dat_ban` (`ma_dat_ban`),
  KEY `idx_trang_thai` (`trang_thai`),
  CONSTRAINT `fk_thanh_toan_dat_ban` FOREIGN KEY (`ma_dat_ban`) REFERENCES `dat_ban` (`ma_dat_ban`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thanh_toan_dat_ban`
--

LOCK TABLES `thanh_toan_dat_ban` WRITE;
/*!40000 ALTER TABLE `thanh_toan_dat_ban` DISABLE KEYS */;
INSERT INTO `thanh_toan_dat_ban` VALUES (1,9,'DB0000095355',1050000.00,'DB000009','pending','2025-12-25 15:45:55',NULL,'2025-12-25 15:50:55',NULL),(2,10,'DB0000101778',100000.00,'DB000010','paid','2025-12-25 15:53:21','2025-12-25 15:53:25','2025-12-25 15:58:22',NULL),(3,11,'DB0000110865',1050000.00,'DB000011','paid','2025-12-25 16:00:20','2025-12-25 16:00:25','2025-12-25 16:05:21',NULL),(4,12,'DB0000124541',50000.00,'DB000012','paid','2025-12-25 16:01:24','2025-12-25 16:01:29','2025-12-25 16:06:25',NULL),(5,13,'DB0000139217',1050000.00,'DB000013','paid','2025-12-25 16:04:59','2025-12-25 16:05:03','2025-12-25 16:09:59',NULL),(6,14,'DB0000146174',1050000.00,'DB000014','paid','2025-12-25 16:29:16','2025-12-25 16:29:18','2025-12-25 16:34:16',NULL),(7,15,'DB0000153614',950000.00,'DB000015','paid','2025-12-25 16:42:43','2025-12-25 16:42:51','2025-12-25 16:47:44',NULL),(8,16,'DB0000169209',450000.00,'DB000016','paid','2025-12-25 16:43:59','2025-12-25 16:44:01','2025-12-25 16:48:59',NULL),(9,17,'DB0000170528',300000.00,'DB000017','paid','2025-12-25 16:47:10','2025-12-25 16:47:14','2025-12-25 16:52:11',NULL),(10,18,'DB000018145990',600000.00,'DB000018','paid','2025-12-25 16:49:05','2025-12-25 16:49:08','2025-12-25 16:54:06',NULL),(11,19,'DB000019362737',1000000.00,'DB000019','paid','2025-12-25 23:32:42','2025-12-25 23:32:45','2025-12-25 23:37:43',NULL),(12,20,'DB000020153246',450000.00,'DB000020','paid','2025-12-25 23:45:53','2025-12-25 23:45:55','2025-12-25 23:50:53',NULL),(13,21,'DB000021747609',450000.00,'DB000021','paid','2025-12-25 23:55:47','2025-12-25 23:55:49','2025-12-26 00:00:48',NULL),(14,22,'DB000022048323',1050000.00,'DB000022','paid','2025-12-27 15:27:28','2025-12-27 15:27:37','2025-12-27 15:32:28',NULL),(15,23,'DB000023730144',1050000.00,'DB000023','paid','2026-01-12 23:02:10','2026-01-12 23:02:14','2026-01-12 23:07:10',NULL),(16,24,'DB000024034367',20000.00,'DB000024','paid','2026-01-16 08:13:54','2026-01-16 08:14:09','2026-01-16 08:18:54',NULL);
/*!40000 ALTER TABLE `thanh_toan_dat_ban` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thong_bao`
--

DROP TABLE IF EXISTS `thong_bao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thong_bao` (
  `ma_thong_bao` int NOT NULL AUTO_INCREMENT,
  `ma_nguoi_dung` int NOT NULL COMMENT 'Người nhận thông báo',
  `loai` enum('news','promo','comment_reply','comment_like','order_status','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system' COMMENT 'Loại thông báo',
  `tieu_de` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề thông báo',
  `noi_dung` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung chi tiết',
  `duong_dan` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Link liên quan',
  `ma_lien_quan` int DEFAULT NULL COMMENT 'ID của đối tượng liên quan (tin tức, bình luận, đơn hàng...)',
  `da_doc` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: chưa đọc, 1: đã đọc',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_thong_bao`),
  KEY `idx_nguoi_dung` (`ma_nguoi_dung`),
  KEY `idx_da_doc` (`da_doc`),
  KEY `idx_loai` (`loai`),
  KEY `idx_ngay_tao` (`ngay_tao`),
  CONSTRAINT `thong_bao_ibfk_1` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu thông báo cho người dùng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thong_bao`
--

LOCK TABLES `thong_bao` WRITE;
/*!40000 ALTER TABLE `thong_bao` DISABLE KEYS */;
INSERT INTO `thong_bao` VALUES (1,1,'news','Bài viết mới: Khai trương chi nhánh mới','Nhà hàng Phương Nam vừa khai trương chi nhánh mới tại Vĩnh Long!','tin-tuc-chi-tiet.html?id=6',NULL,0,'2025-12-14 15:04:38'),(2,1,'promo','Khuyến mãi đặc biệt cuối tuần','Giảm 20% cho tất cả các món ăn vào cuối tuần này!','thuc-don.html',NULL,0,'2025-12-14 15:04:38'),(3,2,'comment_reply','Admin đã trả lời bình luận của bạn','Cảm ơn bạn đã ủng hộ nhà hàng!','tin-tuc-chi-tiet.html?id=6',NULL,0,'2025-12-14 15:04:38'),(4,3,'comment_like','Có người thích bình luận của bạn','Nguyễn Văn A đã thích bình luận của bạn','tin-tuc-chi-tiet.html?id=7',NULL,1,'2025-12-14 15:04:38'),(5,1,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,0,'2025-12-14 15:14:51'),(6,2,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,0,'2025-12-14 15:14:51'),(7,3,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,1,'2025-12-14 15:14:51'),(8,4,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,1,'2025-12-14 15:14:51'),(9,5,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,0,'2025-12-14 15:14:51'),(10,6,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,0,'2025-12-14 15:14:51'),(11,8,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,1,'2025-12-14 15:14:51'),(14,11,'news','Bài viết mới: Giáng sinh an lành tại Phương Nam','Giáng sinh về trên miền Phương Nam không có tuyết trắng, chỉ có nắng nhẹ, gió hiền và hơi ấm lan từ những bữa cơm sum vầy. Đó là mùa của yêu thương chảy chậm, của lòng người mở cửa, của bình an gõ khẽ vào tim mỗi nhà.','tin-tuc-chi-tiet.html?id=11',11,0,'2025-12-14 15:14:51'),(15,8,'comment_reply','Nguyễn Huỳnh Kĩ Thuật đã trả lời bình luận của bạn','Cảm ơn Vũ nè','tin-tuc-chi-tiet.html?id=11',39,1,'2025-12-14 15:15:48'),(16,8,'comment_reply','Nguyễn Huỳnh Kĩ Thuật đã trả lời bình luận của bạn','Bạn muốn trang trí như nào','tin-tuc-chi-tiet.html?id=11',39,1,'2025-12-14 15:18:31'),(17,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đang chờ xác nhận','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:00'),(18,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đã được xác nhận','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:03'),(19,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đang được chuẩn bị','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:05'),(20,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đã giao thành công','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:08'),(21,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đã giao thành công','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:10'),(22,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đã giao thành công','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:11'),(23,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đã được xác nhận','don-hang-cua-toi.html',67,0,'2025-12-16 13:46:14'),(24,11,'order_status','Cập nhật đơn hàng #67','Đơn hàng đã giao thành công','don-hang-cua-toi.html',67,1,'2025-12-16 13:46:18'),(25,11,'order_status','Cập nhật đơn hàng #68','Đơn hàng đã giao thành công','don-hang-cua-toi.html',68,0,'2025-12-21 14:04:41'),(26,8,'system','Đặt bàn đã bị hủy','Đặt bàn #8 của bạn đã bị hủy. Vui lòng liên hệ nhà hàng nếu cần hỗ trợ.','/dat-ban-cua-toi.html',8,0,'2025-12-25 16:18:23'),(27,8,'system','Đặt bàn đã hoàn thành','Cảm ơn bạn đã đến nhà hàng! Đặt bàn #8 đã được ghi nhận hoàn thành.','/dat-ban-cua-toi.html',8,1,'2025-12-25 16:30:30'),(28,8,'system','Đặt bàn đã hoàn thành','Cảm ơn bạn đã đến nhà hàng! Đặt bàn #16 đã được ghi nhận hoàn thành.','/dat-ban-cua-toi.html',16,0,'2025-12-25 16:44:11'),(29,8,'system','Đặt bàn đã hoàn thành','Cảm ơn bạn đã đến nhà hàng! Đặt bàn #17 đã được ghi nhận hoàn thành.','/dat-ban-cua-toi.html',17,1,'2025-12-25 16:47:39'),(30,8,'order_status','Cập nhật đơn hàng #70','Đơn hàng đã giao thành công','don-hang-cua-toi.html',70,1,'2026-01-12 23:02:50'),(31,8,'order_status','Cập nhật đơn hàng #70','Đơn hàng đã bị hủy','don-hang-cua-toi.html',70,1,'2026-01-12 23:15:08'),(32,1,'order_status','Cập nhật đơn hàng #1','Đơn hàng đã bị hủy','don-hang-cua-toi.html',1,0,'2026-03-24 16:35:18'),(33,1,'order_status','Cập nhật đơn hàng #1','Đơn hàng đã bị hủy','don-hang-cua-toi.html',1,0,'2026-03-24 16:35:19'),(34,1,'order_status','Cập nhật đơn hàng #1','Đơn hàng đã bị hủy','don-hang-cua-toi.html',1,0,'2026-03-24 16:35:23'),(35,1,'order_status','Cập nhật đơn hàng #1','Đơn hàng đã bị hủy','don-hang-cua-toi.html',1,0,'2026-03-24 16:35:23'),(36,1,'order_status','Cập nhật đơn hàng #1','Đơn hàng đã giao thành công','don-hang-cua-toi.html',1,0,'2026-03-24 16:35:24'),(37,1,'order_status','Cập nhật đơn hàng #1','Đơn hàng đã bị hủy','don-hang-cua-toi.html',1,0,'2026-03-24 16:35:25'),(38,2,'system','Đặt bàn đã bị hủy','Đặt bàn #1 của bạn đã bị hủy. Vui lòng liên hệ nhà hàng nếu cần hỗ trợ.','/dat-ban-cua-toi.html',1,0,'2026-03-24 16:35:34'),(39,3,'order_status','Cập nhật đơn hàng #20','Đơn hàng đã bị hủy','don-hang-cua-toi.html',20,1,'2026-05-05 08:46:36'),(40,3,'order_status','Cập nhật đơn hàng #20','Đơn hàng đã bị hủy','don-hang-cua-toi.html',20,1,'2026-05-05 08:46:38'),(41,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,1,'2026-06-08 10:19:05'),(42,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:12'),(43,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:13'),(44,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:13'),(45,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã được xác nhận','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:46'),(46,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:48'),(47,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đang được chuẩn bị','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:49'),(48,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã được xác nhận','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:49'),(49,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,1,'2026-06-08 10:22:50'),(50,3,'order_status','Cập nhật đơn hàng #32','Đơn hàng đã giao thành công','don-hang-cua-toi.html',32,1,'2026-06-08 10:40:01'),(51,4,'order_status','Cập nhật đơn hàng #34','Đơn hàng đã giao thành công','don-hang-cua-toi.html',34,1,'2026-06-19 12:15:05'),(52,3,'order_status','Cập nhật đơn hàng #33','Đơn hàng đã giao thành công','don-hang-cua-toi.html',33,1,'2026-07-03 21:40:59'),(53,3,'order_status','Cập nhật đơn hàng #31','Đơn hàng đã giao thành công','don-hang-cua-toi.html',31,0,'2026-07-03 21:42:48'),(54,3,'order_status','Cập nhật đơn hàng #75','Đơn hàng đã giao thành công','don-hang-cua-toi.html',75,0,'2026-07-07 07:41:11');
/*!40000 ALTER TABLE `thong_bao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thong_bao_admin`
--

DROP TABLE IF EXISTS `thong_bao_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thong_bao_admin` (
  `ma_thong_bao` int NOT NULL AUTO_INCREMENT,
  `loai` enum('new_order','new_reservation','new_comment','new_review','new_user','contact_message','comment_like','system') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `tieu_de` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci,
  `duong_dan` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_lien_quan` int DEFAULT NULL,
  `da_doc` tinyint(1) DEFAULT '0',
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_thong_bao`),
  KEY `idx_da_doc` (`da_doc`),
  KEY `idx_ngay_tao` (`ngay_tao`),
  KEY `idx_loai` (`loai`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thong_bao_admin`
--

LOCK TABLES `thong_bao_admin` WRITE;
/*!40000 ALTER TABLE `thong_bao_admin` DISABLE KEYS */;
INSERT INTO `thong_bao_admin` VALUES (1,'comment_like','Đỗ Thiên Vũ thả ❤️ vào bài viết','Tin tức: \"Giáng sinh an lành tại Phương Nam\"','tin-tuc-chi-tiet.html?id=11',11,1,'2025-12-14 08:39:30'),(2,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:40:09'),(3,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:40:14'),(4,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:40:15'),(5,'comment_like','Đỗ Thiên Vũ thả ❤️ vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:40:23'),(6,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','../tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:46:46'),(7,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','../tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:48:15'),(8,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','../tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:48:20'),(9,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','../tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:48:20'),(10,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Ra Mắt Thực Đơn Mùa Thu 2025\"','../tin-tuc-chi-tiet.html?id=7',7,1,'2025-12-14 08:52:23'),(11,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Giáng sinh an lành tại Phương Nam\"','../tin-tuc-chi-tiet.html?id=11',11,1,'2025-12-14 09:02:36'),(12,'comment_like','Đỗ Thiên Vũ thả ? vào bài viết','Tin tức: \"Giáng sinh an lành tại Phương Nam\"','../tin-tuc-chi-tiet.html?id=11',11,1,'2025-12-14 09:02:47'),(13,'new_order','Đơn hàng mới #67','Thuật Thuật đã đặt 1 món - Tổng: 450.000đ','quan-ly-don-hang.html?id=67',67,1,'2025-12-16 06:19:16'),(14,'new_order','Đơn hàng mới #68','Thuật Thuật đã đặt 1 món - Tổng: 405.000đ','orders.html?id=68',68,1,'2025-12-16 06:52:48'),(15,'new_order','Đơn hàng mới #69','Đỗ Thiên Vũ đã đặt 1 món - Tổng: 480.000đ','orders.html?id=69',69,1,'2025-12-23 07:46:20'),(16,'new_comment','Bình luận mới từ Đỗ Thiên Vũ','\"ok\" - Tin tức: Giáng sinh an lành tại Phương Nam','../tin-tuc-chi-tiet.html?id=11',42,1,'2026-01-12 15:58:23'),(17,'new_order','Đơn hàng mới #70','Đỗ Thiên Vũ đã đặt 2 món - Tổng: 950.000đ','orders.html?id=70',70,1,'2026-01-12 15:59:47'),(18,'comment_like','Thiên Vũ Đỗ thả ? vào bài viết','Tin tức: \"Khai trương chi nhánh mới\"','../tin-tuc-chi-tiet.html?id=1',1,1,'2026-03-24 09:08:26'),(19,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 08:46:51'),(20,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 08:55:11'),(21,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 08:56:12'),(22,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 08:57:04'),(23,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 08:59:49'),(24,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:00:10'),(25,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:14:41'),(26,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:14:51'),(27,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:17:58'),(28,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 500.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:18:20'),(29,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Thịt bầm\" chỉ còn 0.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:20:18'),(30,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(31,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(32,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(33,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(34,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(35,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(36,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(37,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(38,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 5000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:30:07'),(39,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 100000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:31:00'),(40,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 3000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:32:36'),(41,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bún tươi\" chỉ còn 5.00 kg (Mức cảnh báo: 3000.00)','/admin/inventory.html',NULL,1,'2026-03-25 09:35:37'),(42,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 02:12:24'),(43,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 02:13:41'),(44,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 02:14:33'),(45,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 02:16:26'),(46,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 02:20:07'),(47,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 02:48:14'),(48,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 03:11:06'),(49,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 03:11:18'),(50,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-26 03:17:22'),(51,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-27 07:02:34'),(52,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-27 07:08:24'),(53,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-27 08:52:05'),(54,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-27 08:52:15'),(55,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-27 08:56:25'),(56,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-28 05:42:57'),(57,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-28 05:43:37'),(58,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 120.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-28 08:34:15'),(59,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bia Tiger bạc lon lùn\" chỉ còn 118.00 cai (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-03-30 06:15:29'),(60,'new_order','Đơn hàng mới #12','celras tvu đã đặt 1 món - Tổng: 200.000đ','orders.html?id=12',12,1,'2026-04-22 09:34:22'),(61,'new_order','Đơn hàng mới #13','celras tvu đã đặt 1 món - Tổng: 250.000đ','orders.html?id=13',13,1,'2026-04-22 10:03:39'),(62,'new_order','Đơn hàng mới #14','celras tvu đã đặt 1 món - Tổng: 250.000đ','orders.html?id=14',14,1,'2026-04-22 10:04:21'),(63,'new_order','Đơn hàng mới #15','thaovy dichvudulich đã đặt 1 món - Tổng: 250.000đ','orders.html?id=15',15,1,'2026-04-22 10:06:34'),(64,'new_order','Đơn hàng mới #16','Thuật Thuật đã đặt 1 món - Tổng: 200.000đ','orders.html?id=16',16,1,'2026-04-23 04:02:17'),(65,'system','Cảnh báo: Nguyên liệu sắp hết','Nguyên liệu \"Bánh phồng\" chỉ còn 1000.00 g (Mức cảnh báo: 1000.00)','/admin/inventory.html',NULL,1,'2026-05-02 02:13:57'),(66,'new_order','Đơn hàng mới #17','Thuật Thuật đã đặt 1 món - Tổng: 199.000đ','orders.html?id=17',17,1,'2026-05-02 05:15:51'),(67,'new_order','Đơn hàng mới #19','Thuật Thuật đã đặt 1 món - Tổng: 199.000đ','orders.html?id=19',19,1,'2026-05-02 05:17:58'),(68,'new_order','Đơn hàng mới #20','Thuật Thuật đã đặt 1 món - Tổng: 199.000đ','orders.html?id=20',20,1,'2026-05-02 05:25:55'),(69,'new_order','Đơn hàng mới #21','Thuật Thuật đã đặt 1 món - Tổng: 199.000đ','orders.html?id=21',21,1,'2026-05-13 02:40:01'),(70,'new_order','Đơn hàng mới #23','Thiên Vũ Đỗ đã đặt 2 món - Tổng: 280.000đ','orders.html?id=23',23,1,'2026-05-18 03:42:43'),(71,'new_order','Đơn hàng mới #27','Thuật Thuật đã đặt 1 món - Tổng: 250.000đ','orders.html?id=27',27,1,'2026-05-31 04:14:53'),(72,'new_order','Đơn hàng mới #28','Thuật Thuật đã đặt 1 món - Tổng: 250.000đ','orders.html?id=28',28,1,'2026-06-07 06:31:39'),(73,'new_order','Đơn hàng mới #29','Thuật Thuật đã đặt 1 món - Tổng: 250.000đ','orders.html?id=29',29,1,'2026-06-07 06:36:44'),(74,'new_order','Đơn hàng mới #31','Thuật Thuật đã đặt 1 món - Tổng: 129.000đ','orders.html?id=31',31,1,'2026-06-08 03:16:18'),(75,'new_order','Đơn hàng mới #32','Thuật Thuật đã đặt 1 món - Tổng: 129.000đ','orders.html?id=32',32,1,'2026-06-08 03:39:44'),(76,'new_order','Đơn hàng mới #33','Thuật Thuật đã đặt 1 món - Tổng: 68.000đ','orders.html?id=33',33,0,'2026-06-18 15:52:27'),(77,'new_order','Đơn hàng mới #34','Thiên Vũ Đỗ đã đặt 1 món - Tổng: 300.000đ','orders.html?id=34',34,0,'2026-06-19 05:14:18'),(78,'new_order','Đơn hàng mới #75','Thuật Thuật đã đặt 1 món - Tổng: 450.000đ','orders.html?id=75',75,0,'2026-07-07 00:39:22');
/*!40000 ALTER TABLE `thong_bao_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thong_ke_hang_ngay`
--

DROP TABLE IF EXISTS `thong_ke_hang_ngay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thong_ke_hang_ngay` (
  `ma_thong_ke` int NOT NULL AUTO_INCREMENT,
  `ngay_thong_ke` date NOT NULL,
  `doanh_thu` decimal(15,2) DEFAULT '0.00',
  `so_don_hang` int DEFAULT '0',
  `so_khach_hang_moi` int DEFAULT '0',
  `luot_truy_cap` int DEFAULT '0',
  PRIMARY KEY (`ma_thong_ke`),
  UNIQUE KEY `ngay_thong_ke` (`ngay_thong_ke`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thong_ke_hang_ngay`
--

LOCK TABLES `thong_ke_hang_ngay` WRITE;
/*!40000 ALTER TABLE `thong_ke_hang_ngay` DISABLE KEYS */;
INSERT INTO `thong_ke_hang_ngay` VALUES (1,'2025-10-08',5600000.00,42,8,1250),(2,'2025-10-09',6200000.00,48,12,1380),(3,'2025-10-10',7100000.00,53,15,1520),(4,'2025-10-11',5900000.00,45,9,1420),(5,'2025-10-12',6800000.00,51,11,1650);
/*!40000 ALTER TABLE `thong_ke_hang_ngay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thong_ke_ngay`
--

DROP TABLE IF EXISTS `thong_ke_ngay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thong_ke_ngay` (
  `ngay` date NOT NULL,
  `tong_don_online` int DEFAULT '0',
  `tong_order_tai_ban` int DEFAULT '0',
  `tong_doanh_thu` decimal(14,2) DEFAULT '0.00',
  `mon_ban_chay_nhat` int DEFAULT NULL,
  PRIMARY KEY (`ngay`),
  KEY `fk_tk_mon` (`mon_ban_chay_nhat`),
  CONSTRAINT `fk_tk_mon` FOREIGN KEY (`mon_ban_chay_nhat`) REFERENCES `mon_an` (`ma_mon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thong_ke_ngay`
--

LOCK TABLES `thong_ke_ngay` WRITE;
/*!40000 ALTER TABLE `thong_ke_ngay` DISABLE KEYS */;
/*!40000 ALTER TABLE `thong_ke_ngay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thuoc_tinh_khau_vi`
--

DROP TABLE IF EXISTS `thuoc_tinh_khau_vi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thuoc_tinh_khau_vi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_thuoc_tinh` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ten_thuoc_tinh` (`ten_thuoc_tinh`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuoc_tinh_khau_vi`
--

LOCK TABLES `thuoc_tinh_khau_vi` WRITE;
/*!40000 ALTER TABLE `thuoc_tinh_khau_vi` DISABLE KEYS */;
INSERT INTO `thuoc_tinh_khau_vi` VALUES (10,'Bia tươi'),(9,'Đồ chiên'),(1,'? Cay'),(5,'? Chay'),(2,'? Chua'),(8,'? Hải sản'),(3,'? Mặn'),(4,'? Ngọt'),(7,'? Nhiều đạm'),(6,'? Thanh đạm');
/*!40000 ALTER TABLE `thuoc_tinh_khau_vi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tin_tuc`
--

DROP TABLE IF EXISTS `tin_tuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tin_tuc` (
  `ma_tin_tuc` int NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tom_tat` text COLLATE utf8mb4_unicode_ci,
  `noi_dung` longtext COLLATE utf8mb4_unicode_ci,
  `anh_dai_dien` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ma_admin_dang` int DEFAULT NULL,
  `luot_xem` int DEFAULT '0',
  `trang_thai` tinyint DEFAULT '1',
  `ngay_dang` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_tin_tuc`),
  KEY `fk_tintuc_admin` (`ma_admin_dang`),
  CONSTRAINT `fk_tintuc_admin` FOREIGN KEY (`ma_admin_dang`) REFERENCES `admin` (`ma_admin`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tin_tuc`
--

LOCK TABLES `tin_tuc` WRITE;
/*!40000 ALTER TABLE `tin_tuc` DISABLE KEYS */;
INSERT INTO `tin_tuc` VALUES (1,'Khai trương chi nhánh mới','Giảm ngay 20%','Nội dung chi tiết bài viết...','images/news-1774343062124-217844686.jpg',1,2,1,'2026-03-23 08:58:24');
/*!40000 ALTER TABLE `tin_tuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tra_loi_danh_gia`
--

DROP TABLE IF EXISTS `tra_loi_danh_gia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tra_loi_danh_gia` (
  `ma_tra_loi` int NOT NULL AUTO_INCREMENT,
  `ma_danh_gia` int NOT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_admin` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT 'Admin',
  `ngay_tra_loi` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_tra_loi`),
  KEY `fk_tl_dg` (`ma_danh_gia`),
  CONSTRAINT `fk_tl_dg` FOREIGN KEY (`ma_danh_gia`) REFERENCES `danh_gia_san_pham` (`ma_danh_gia`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tra_loi_danh_gia`
--

LOCK TABLES `tra_loi_danh_gia` WRITE;
/*!40000 ALTER TABLE `tra_loi_danh_gia` DISABLE KEYS */;
/*!40000 ALTER TABLE `tra_loi_danh_gia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tri_thuc_chatbot`
--

DROP TABLE IF EXISTS `tri_thuc_chatbot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tri_thuc_chatbot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `embedding` json DEFAULT NULL,
  `loai` enum('san_pham','khuyen_mai','faq','chinh_sach') COLLATE utf8mb4_unicode_ci DEFAULT 'faq',
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tri_thuc_chatbot`
--

LOCK TABLES `tri_thuc_chatbot` WRITE;
/*!40000 ALTER TABLE `tri_thuc_chatbot` DISABLE KEYS */;
INSERT INTO `tri_thuc_chatbot` VALUES (1,'Giờ mở cửa','Nhà hàng mở cửa từ 7:00 đến 22:00 hàng ngày.',NULL,'faq','2026-03-23 08:58:24'),(2,'Chính sách hoàn tiền','Hủy đơn trước 30 phút sẽ được hoàn lại 100%.',NULL,'chinh_sach','2026-03-23 08:58:24');
/*!40000 ALTER TABLE `tri_thuc_chatbot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_embedding`
--

DROP TABLE IF EXISTS `user_embedding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_embedding` (
  `ma_nguoi_dung` int NOT NULL,
  `vector` json NOT NULL,
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nguoi_dung`),
  CONSTRAINT `fk_emb_user` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_embedding`
--

LOCK TABLES `user_embedding` WRITE;
/*!40000 ALTER TABLE `user_embedding` DISABLE KEYS */;
INSERT INTO `user_embedding` VALUES (1,'[0.12, 0.88, 0.45, 0.67]','2026-03-23 08:58:24'),(2,'[0.55, 0.22, 0.99, 0.11]','2026-03-23 08:58:24');
/*!40000 ALTER TABLE `user_embedding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preference_profile`
--

DROP TABLE IF EXISTS `user_preference_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preference_profile` (
  `ma_nguoi_dung` int NOT NULL,
  `tag_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(10,2) NOT NULL DEFAULT '0.00',
  `positive_count` int NOT NULL DEFAULT '0',
  `negative_count` int NOT NULL DEFAULT '0',
  `mention_count` int NOT NULL DEFAULT '0',
  `confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
  `source_summary` text COLLATE utf8mb4_unicode_ci,
  `ngay_cap_nhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nguoi_dung`,`tag_key`),
  KEY `idx_tag_score` (`tag_key`,`score`),
  KEY `idx_user_score` (`ma_nguoi_dung`,`score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preference_profile`
--

LOCK TABLES `user_preference_profile` WRITE;
/*!40000 ALTER TABLE `user_preference_profile` DISABLE KEYS */;
INSERT INTO `user_preference_profile` VALUES (1,'cay',1.65,1,0,1,0.36,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:15'),(1,'chua',1.65,1,0,1,0.36,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:15'),(1,'com_bun_mi',3.60,1,0,1,0.62,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:15'),(1,'man',1.65,1,0,1,0.36,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:15'),(1,'ngot',1.65,1,0,1,0.36,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:15'),(3,'chua',3.00,2,0,2,0.68,'{\"mentions\":2,\"positive_count\":2,\"negative_count\":0}','2026-07-07 07:00:28'),(3,'do_uong',1.50,1,0,1,0.62,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-07 07:00:28'),(3,'hai_san',1.50,4,3,7,0.89,'{\"mentions\":7,\"positive_count\":4,\"negative_count\":3}','2026-07-07 07:00:28'),(3,'lau',3.00,3,1,4,0.83,'{\"mentions\":4,\"positive_count\":3,\"negative_count\":1}','2026-07-07 07:00:28'),(3,'nuong',3.00,2,0,2,0.69,'{\"mentions\":2,\"positive_count\":2,\"negative_count\":0}','2026-07-07 07:00:28'),(3,'phuc_vu',1.50,1,0,1,0.62,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-07 07:00:28'),(3,'thanh_mat',10.50,8,1,9,0.88,'{\"mentions\":9,\"positive_count\":8,\"negative_count\":1}','2026-07-07 07:00:28'),(3,'thit_bo',3.00,2,0,2,0.68,'{\"mentions\":2,\"positive_count\":2,\"negative_count\":0}','2026-07-07 07:00:28'),(3,'thit_ga',18.00,12,0,12,0.89,'{\"mentions\":12,\"positive_count\":12,\"negative_count\":0}','2026-07-07 07:00:28'),(3,'tuoi',4.50,3,0,3,0.76,'{\"mentions\":3,\"positive_count\":3,\"negative_count\":0}','2026-07-07 07:00:28'),(4,'do_uong',1.50,1,0,1,0.62,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:16'),(4,'hai_san',1.50,1,0,1,0.62,'{\"mentions\":1,\"positive_count\":1,\"negative_count\":0}','2026-07-04 11:10:16'),(5,'lau',3.00,2,0,2,0.69,'{\"mentions\":2,\"positive_count\":2,\"negative_count\":0}','2026-07-04 11:10:16'),(5,'thanh_mat',7.50,5,0,5,0.87,'{\"mentions\":5,\"positive_count\":5,\"negative_count\":0}','2026-07-04 11:10:16'),(5,'thit_ga',9.00,6,0,6,0.89,'{\"mentions\":6,\"positive_count\":6,\"negative_count\":0}','2026-07-04 11:10:16');
/*!40000 ALTER TABLE `user_preference_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vai_tro_he_thong`
--

DROP TABLE IF EXISTS `vai_tro_he_thong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vai_tro_he_thong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_vai_tro` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ten_vai_tro` (`ten_vai_tro`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vai_tro_he_thong`
--

LOCK TABLES `vai_tro_he_thong` WRITE;
/*!40000 ALTER TABLE `vai_tro_he_thong` DISABLE KEYS */;
INSERT INTO `vai_tro_he_thong` VALUES (1,'admin','Quản trị viên toàn hệ thống','2026-03-29 11:32:32'),(2,'manager','Quản lý cửa hàng','2026-03-29 11:32:32'),(3,'receptionist','Thu ngân / Lễ tân','2026-03-29 11:32:32'),(4,'server','Nhân viên phục vụ','2026-03-29 11:32:32'),(5,'chef','Đầu bếp','2026-03-29 11:32:32'),(6,'security','Bảo vệ','2026-03-29 11:32:32');
/*!40000 ALTER TABLE `vai_tro_he_thong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `xac_nhan_thanh_toan`
--

DROP TABLE IF EXISTS `xac_nhan_thanh_toan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `xac_nhan_thanh_toan` (
  `ma_xac_nhan` int NOT NULL AUTO_INCREMENT,
  `ma_don_hang` int NOT NULL,
  `so_tien` decimal(14,2) NOT NULL,
  `phuong_thuc` varchar(50) DEFAULT 'cash',
  `ma_giao_dich` varchar(255) DEFAULT NULL,
  `ket_qua` enum('pending','success','failed','cancel') DEFAULT 'pending',
  `thoi_gian_xac_nhan` datetime DEFAULT NULL,
  `thong_tin_them` text,
  PRIMARY KEY (`ma_xac_nhan`),
  KEY `ma_don_hang` (`ma_don_hang`),
  KEY `ma_giao_dich` (`ma_giao_dich`),
  CONSTRAINT `xac_nhan_thanh_toan_ibfk_1` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `xac_nhan_thanh_toan`
--

LOCK TABLES `xac_nhan_thanh_toan` WRITE;
/*!40000 ALTER TABLE `xac_nhan_thanh_toan` DISABLE KEYS */;
INSERT INTO `xac_nhan_thanh_toan` VALUES (1,1,125000.00,'momo','GD123456','success','2025-09-09 23:24:07',NULL),(2,2,60000.00,'cash',NULL,'pending',NULL,NULL);
/*!40000 ALTER TABLE `xac_nhan_thanh_toan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `xac_thuc_email`
--

DROP TABLE IF EXISTS `xac_thuc_email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `xac_thuc_email` (
  `ma_xac_thuc` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_nguoi_dung` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mat_khau_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_chi` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gioi_tinh` enum('khac','nam','nu') COLLATE utf8mb4_unicode_ci DEFAULT 'khac',
  `anh_dai_dien` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_het_han` datetime NOT NULL,
  `trang_thai` enum('pending','verified','expired','reset_password') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  PRIMARY KEY (`ma_xac_thuc`),
  KEY `email` (`email`),
  KEY `ma_code` (`ma_code`),
  KEY `ngay_het_han` (`ngay_het_han`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `xac_thuc_email`
--

LOCK TABLES `xac_thuc_email` WRITE;
/*!40000 ALTER TABLE `xac_thuc_email` DISABLE KEYS */;
/*!40000 ALTER TABLE `xac_thuc_email` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09 22:55:04
