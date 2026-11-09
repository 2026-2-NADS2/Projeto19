CREATE DATABASE  IF NOT EXISTS `kfka` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `kfka`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: kfka
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `acompanhamentos`
--

DROP TABLE IF EXISTS `acompanhamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acompanhamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `disciplina_id` int NOT NULL,
  `periodo_id` int NOT NULL,
  `descricao` text NOT NULL,
  `media` decimal(5,2) DEFAULT NULL,
  `status` enum('rascunho','pendente','publicado','devolvido') NOT NULL DEFAULT 'rascunho',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `publicado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `aluno_id` (`aluno_id`),
  KEY `professor_id` (`professor_id`),
  KEY `disciplina_id` (`disciplina_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `acompanhamentos_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `acompanhamentos_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `acompanhamentos_ibfk_3` FOREIGN KEY (`disciplina_id`) REFERENCES `disciplinas` (`id`),
  CONSTRAINT `acompanhamentos_ibfk_4` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_avaliativos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acompanhamentos`
--

LOCK TABLES `acompanhamentos` WRITE;
/*!40000 ALTER TABLE `acompanhamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `acompanhamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acompanhamentos_tags`
--

DROP TABLE IF EXISTS `acompanhamentos_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acompanhamentos_tags` (
  `acompanhamento_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`acompanhamento_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `acompanhamentos_tags_ibfk_1` FOREIGN KEY (`acompanhamento_id`) REFERENCES `acompanhamentos` (`id`),
  CONSTRAINT `acompanhamentos_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acompanhamentos_tags`
--

LOCK TABLES `acompanhamentos_tags` WRITE;
/*!40000 ALTER TABLE `acompanhamentos_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `acompanhamentos_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alunos`
--

DROP TABLE IF EXISTS `alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `matricula` varchar(30) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula` (`matricula`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos`
--

LOCK TABLES `alunos` WRITE;
/*!40000 ALTER TABLE `alunos` DISABLE KEYS */;
/*!40000 ALTER TABLE `alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alunos_turmas`
--

DROP TABLE IF EXISTS `alunos_turmas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alunos_turmas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aluno_id` int NOT NULL,
  `turma_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aluno_id` (`aluno_id`,`turma_id`),
  KEY `turma_id` (`turma_id`),
  CONSTRAINT `alunos_turmas_ibfk_1` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`),
  CONSTRAINT `alunos_turmas_ibfk_2` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alunos_turmas`
--

LOCK TABLES `alunos_turmas` WRITE;
/*!40000 ALTER TABLE `alunos_turmas` DISABLE KEYS */;
/*!40000 ALTER TABLE `alunos_turmas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciencias_acompanhamentos`
--

DROP TABLE IF EXISTS `ciencias_acompanhamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciencias_acompanhamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acompanhamento_id` int NOT NULL,
  `responsavel_id` int NOT NULL,
  `confirmado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unica_ciencia` (`acompanhamento_id`,`responsavel_id`),
  KEY `responsavel_id` (`responsavel_id`),
  CONSTRAINT `ciencias_acompanhamentos_ibfk_1` FOREIGN KEY (`acompanhamento_id`) REFERENCES `acompanhamentos` (`id`),
  CONSTRAINT `ciencias_acompanhamentos_ibfk_2` FOREIGN KEY (`responsavel_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciencias_acompanhamentos`
--

LOCK TABLES `ciencias_acompanhamentos` WRITE;
/*!40000 ALTER TABLE `ciencias_acompanhamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ciencias_acompanhamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acompanhamento_id` int NOT NULL,
  `responsavel_id` int NOT NULL,
  `texto` text NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `acompanhamento_id` (`acompanhamento_id`),
  KEY `responsavel_id` (`responsavel_id`),
  CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`acompanhamento_id`) REFERENCES `acompanhamentos` (`id`),
  CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`responsavel_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disciplinas`
--

DROP TABLE IF EXISTS `disciplinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplinas`
--

LOCK TABLES `disciplinas` WRITE;
/*!40000 ALTER TABLE `disciplinas` DISABLE KEYS */;
/*!40000 ALTER TABLE `disciplinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_acompanhamentos`
--

DROP TABLE IF EXISTS `logs_acompanhamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_acompanhamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acompanhamento_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `acao` enum('ciencia','observacao') NOT NULL,
  `descricao` text,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `acompanhamento_id` (`acompanhamento_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `logs_acompanhamentos_ibfk_1` FOREIGN KEY (`acompanhamento_id`) REFERENCES `acompanhamentos` (`id`),
  CONSTRAINT `logs_acompanhamentos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_acompanhamentos`
--

LOCK TABLES `logs_acompanhamentos` WRITE;
/*!40000 ALTER TABLE `logs_acompanhamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs_acompanhamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos_avaliativos`
--

DROP TABLE IF EXISTS `periodos_avaliativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos_avaliativos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `ano_letivo` year NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_avaliativos`
--

LOCK TABLES `periodos_avaliativos` WRITE;
/*!40000 ALTER TABLE `periodos_avaliativos` DISABLE KEYS */;
/*!40000 ALTER TABLE `periodos_avaliativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professores_turmas_disciplinas`
--

DROP TABLE IF EXISTS `professores_turmas_disciplinas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professores_turmas_disciplinas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `professor_id` int NOT NULL,
  `turma_id` int NOT NULL,
  `disciplina_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `professor_id` (`professor_id`,`turma_id`,`disciplina_id`),
  KEY `turma_id` (`turma_id`),
  KEY `disciplina_id` (`disciplina_id`),
  CONSTRAINT `professores_turmas_disciplinas_ibfk_1` FOREIGN KEY (`professor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `professores_turmas_disciplinas_ibfk_2` FOREIGN KEY (`turma_id`) REFERENCES `turmas` (`id`),
  CONSTRAINT `professores_turmas_disciplinas_ibfk_3` FOREIGN KEY (`disciplina_id`) REFERENCES `disciplinas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professores_turmas_disciplinas`
--

LOCK TABLES `professores_turmas_disciplinas` WRITE;
/*!40000 ALTER TABLE `professores_turmas_disciplinas` DISABLE KEYS */;
/*!40000 ALTER TABLE `professores_turmas_disciplinas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsaveis_alunos`
--

DROP TABLE IF EXISTS `responsaveis_alunos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsaveis_alunos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `responsavel_id` int NOT NULL,
  `aluno_id` int NOT NULL,
  `parentesco` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `responsavel_id` (`responsavel_id`,`aluno_id`),
  KEY `aluno_id` (`aluno_id`),
  CONSTRAINT `responsaveis_alunos_ibfk_1` FOREIGN KEY (`responsavel_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `responsaveis_alunos_ibfk_2` FOREIGN KEY (`aluno_id`) REFERENCES `alunos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsaveis_alunos`
--

LOCK TABLES `responsaveis_alunos` WRITE;
/*!40000 ALTER TABLE `responsaveis_alunos` DISABLE KEYS */;
/*!40000 ALTER TABLE `responsaveis_alunos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revisoes_acompanhamentos`
--

DROP TABLE IF EXISTS `revisoes_acompanhamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revisoes_acompanhamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `acompanhamento_id` int NOT NULL,
  `administrador_id` int NOT NULL,
  `acao` enum('aprovado','devolvido') NOT NULL,
  `observacao` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `acompanhamento_id` (`acompanhamento_id`),
  KEY `administrador_id` (`administrador_id`),
  CONSTRAINT `revisoes_acompanhamentos_ibfk_1` FOREIGN KEY (`acompanhamento_id`) REFERENCES `acompanhamentos` (`id`),
  CONSTRAINT `revisoes_acompanhamentos_ibfk_2` FOREIGN KEY (`administrador_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revisoes_acompanhamentos`
--

LOCK TABLES `revisoes_acompanhamentos` WRITE;
/*!40000 ALTER TABLE `revisoes_acompanhamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `revisoes_acompanhamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turmas`
--

DROP TABLE IF EXISTS `turmas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turmas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `ano_letivo` year NOT NULL,
  `periodo` enum('manha','tarde','noite','integral') NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turmas`
--

LOCK TABLES `turmas` WRITE;
/*!40000 ALTER TABLE `turmas` DISABLE KEYS */;
/*!40000 ALTER TABLE `turmas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `perfil` enum('administrador','professor','responsavel') NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador KFKA','admin@kfka.com','$2b$10$B4sEO5PwvIzEgvKS1e94QeEr4rjFYDnHjj.z04hyPkOBDjnmJaBei','administrador',1,'2026-11-02 21:44:09');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-09 18:08:36
