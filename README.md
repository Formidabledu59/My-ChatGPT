# My-ChatGPT

## la base de donnée

![bdd](img/bdd.png)

```sql
-- Suppression et création de la base de données
DROP DATABASE IF EXISTS `gpt_db`;
CREATE DATABASE `gpt_db`;
USE `gpt_db`;

-- Création des tables
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUser` int DEFAULT NULL,
  `startedAT` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idUser` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idConv` int NOT NULL,
  `sender` varchar(20) NOT NULL,
  `message` varchar(255) NOT NULL,
  `sendAT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idConv` (`idConv`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Liaisons
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`idConv`) REFERENCES `conversations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;
```
