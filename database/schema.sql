/*
  Cabañas Cordoba - MySQL Schema
  - Sin ORMs (lo maneja la API con mysql2)
  - Disponibilidad basada en bloqueos de mantenimiento
  - Regla de solapamiento: block.from < to  Y  block.to > from

  Convención de fechas:
  - from_date = check-in (incluido)
  - to_date   = check-out (excluido)
*/

CREATE DATABASE IF NOT EXISTS cabanas_cordoba
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE cabanas_cordoba;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS cabin_images;
DROP TABLE IF EXISTS cabins;
DROP TABLE IF EXISTS admins;

SET FOREIGN_KEY_CHECKS = 1;

-- Admins (usuario fijo para el panel)
CREATE TABLE admins (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password_salt CHAR(32) NOT NULL,         -- hex de 16 bytes
  password_hash CHAR(64) NOT NULL,         -- hex de 32 bytes (pbkdf2 sha256)
  password_iters INT NOT NULL DEFAULT 120000,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_username (username)
) ENGINE=InnoDB;

-- Cabañas
CREATE TABLE cabins (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  short_description VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  city VARCHAR(80) NOT NULL DEFAULT 'Córdoba',
  province VARCHAR(80) NOT NULL DEFAULT 'Córdoba',
  price_per_night DECIMAL(10,2) NOT NULL,
  max_guests INT NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms INT NOT NULL DEFAULT 1,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cabins_slug (slug),
  KEY idx_cabins_active (is_active),
  KEY idx_cabins_price (price_per_night),
  KEY idx_cabins_guests (max_guests)
) ENGINE=InnoDB;

-- Imágenes (opcional pero útil para landing/detalle)
CREATE TABLE cabin_images (
  id INT NOT NULL AUTO_INCREMENT,
  cabin_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_images_cabin_sort (cabin_id, sort_order),
  CONSTRAINT fk_images_cabin
    FOREIGN KEY (cabin_id) REFERENCES cabins(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bloqueos de mantenimiento (definen disponibilidad)
CREATE TABLE blocks (
  id INT NOT NULL AUTO_INCREMENT,
  cabin_id INT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason VARCHAR(200) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blocks_cabin_dates (cabin_id, from_date, to_date),
  CONSTRAINT fk_blocks_cabin
    FOREIGN KEY (cabin_id) REFERENCES cabins(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_blocks_valid_range CHECK (to_date > from_date)
) ENGINE=InnoDB;
