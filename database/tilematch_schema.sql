-- ============================================================
-- TILEMATCH E-COMMERCE PLATFORM
-- MySQL 8.0 Database Schema
-- Based on SRS Section 6 (ERD) + Functional Requirements
-- ============================================================

-- Create and use database
CREATE DATABASE IF NOT EXISTS tilematch_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tilematch_db;

-- ============================================================
-- 1. CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,          -- hashed via bcrypt
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  phone       VARCHAR(20),
  role        ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  -- CHANGE 1: Truncate columns
/*  -- Address fields (FR-29)
  municipality VARCHAR(100),
  city         VARCHAR(100),
  barangay     VARCHAR(100),
  street       VARCHAR(255),                  -- street + house number
  postal_code  VARCHAR(10),*/
  is_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- CHANGE 2: CREATE TABLES
CREATE TABLE address (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  barangay_id   INT,
  street        VARCHAR(255) NOT NULL,
  FOREIGN KEY (barangay_id) REFERENCES barangay(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE barangay (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  municipality_id   INT,
  name              VARCHAR(255) NOT NULL,
  FOREIGN KEY (municipality_id) REFERENCES municipality(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE municipality (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  zip_code      VARCHAR(10) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE occupancy (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT,
  address_id    INT,
  date_set      DATE,
  FOREIGN KEY customer_id REFERENCES customer(id) ON DELETE SET NULL
  FOREIGN KEY address_id REFERENCES address(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 2. SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  contact_name VARCHAR(200),
  email        VARCHAR(255),
  phone        VARCHAR(20),
  address      TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  category         ENUM('Ceramic', 'Porcelain', 'Glass', 'Natural Stone', 'Decorative') NOT NULL,
  material         VARCHAR(100) NOT NULL,
  color            VARCHAR(50) NOT NULL,
  size             VARCHAR(20) NOT NULL,       -- e.g. '30x30', '60x60'
  room_application VARCHAR(50),                -- Floor | Wall | Outdoor | Bathroom | Kitchen
  price            DECIMAL(10,2) NOT NULL,
  image_url        LONGTEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sold_count       INT NOT NULL DEFAULT 0,
  supplier_id      INT,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_material (material),
  INDEX idx_color (color),
  INDEX idx_price (price),
  INDEX idx_is_active (is_active),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 4. PRODUCT IMAGES (FR-16, FR-55: multiple images per product)
-- ============================================================
CREATE TABLE product_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  image_url   LONGTEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. PRODUCT CHARACTERISTICS
-- ============================================================
CREATE TABLE characteristics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  attr_key    VARCHAR(100) NOT NULL,           -- e.g. 'finish', 'thickness', 'weight'
  attr_value  VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. INVENTORY (FR-62 through FR-67)
-- ============================================================
CREATE TABLE inventory (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  product_id      INT NOT NULL UNIQUE,
  stock_qty       INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,  -- FR-64
  last_updated    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. CART (FR-18 through FR-27, persistent per FR-26)
-- ============================================================
CREATE TABLE cart (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL UNIQUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  cart_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_product (cart_id, product_id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. ORDERS (FR-28 through FR-36)
-- ============================================================
CREATE TABLE orders (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  order_number        VARCHAR(20) NOT NULL UNIQUE,   -- e.g. ORD-2025-0001
  customer_id         INT NOT NULL,
  customer_name       VARCHAR(200) NOT NULL,
  customer_email      VARCHAR(255) NOT NULL,
  -- Shipping address snapshot
  -- CHANGE 3: ship -> delivery
/*  ship_municipality   VARCHAR(100) NOT NULL,
  ship_city           VARCHAR(100) NOT NULL,
  ship_barangay       VARCHAR(100) NOT NULL,
  ship_street         VARCHAR(255) NOT NULL,
  ship_postal_code    VARCHAR(10) NOT NULL,*/
  delivery_municipality   VARCHAR(100) NOT NULL,
  delivery_city           VARCHAR(100) NOT NULL,
  delivery_barangay       VARCHAR(100) NOT NULL,
  delivery_street         VARCHAR(255) NOT NULL,
  delivery_postal_code    VARCHAR(10) NOT NULL,
  subtotal            DECIMAL(10,2) NOT NULL,
  tax                 DECIMAL(10,2) NOT NULL,         -- 12% VAT
  --shipping_fee        DECIMAL(10,2) NOT NULL,
  delivery_fee        DECIMAL(10,2) NOT NULL,
  total               DECIMAL(10,2) NOT NULL,
  status              ENUM('Pending', 'Processing', 'Shipped', 'Delivered') NOT NULL DEFAULT 'Pending',
  estimated_delivery  DATE,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,           -- snapshot at time of order
  quantity    INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,           -- snapshot at time of order
  line_total  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 10. PAYMENT (FR-37 through FR-42)
-- ============================================================
CREATE TABLE payments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_id        INT NOT NULL UNIQUE,
  payment_method  ENUM('GCash') NOT NULL DEFAULT 'GCash',
  payment_ref     VARCHAR(20) NOT NULL,          -- 13-digit GCash reference
  amount          DECIMAL(10,2) NOT NULL,
  status          ENUM('Pending', 'Confirmed') NOT NULL DEFAULT 'Pending',
  paid_at         TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. SALES (reporting table)
-- ============================================================
CREATE TABLE sales (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT NOT NULL,
  category      ENUM('Ceramic', 'Porcelain', 'Glass', 'Natural Stone', 'Decorative') NOT NULL,
  quantity_sold INT NOT NULL,
  revenue       DECIMAL(10,2) NOT NULL,
  sale_date     DATE NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_sale_date (sale_date),
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- ============================================================
-- 12. LOSSES (tracking returns, damages, write-offs)
-- ============================================================
CREATE TABLE losses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  reason      ENUM('Return', 'Damage', 'Write-off', 'Other') NOT NULL,
  notes       TEXT,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- CHANGE 4: Create table
CREATE TABLE product_promo (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  product_id          INT,
  freebie_product_id  INT,
  promo_id            INT NOT NULL,
  category            ENUM('Ceramic', 'Porcelain', 'Glass', 'Natural Stone', 'Decorative'),
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  available_amt       INT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
  FOREIGN KEY (promo_id) REFERENCES promo(id) ON DELETE CASCADE,
  FOREIGN KEY (freebie_product_id) REFERENCES product(id) ON DELETE CASCADE,
  CONSTRAINT CHK_Product_XOR_Category CHECK ( 
    (product_id IS NULL AND category IS NOT NULL) 
    OR 
    (product_id IS NOT NULL AND category IS NULL) 
  )
) ENGINE=InnoDB;

-- ============================================================
-- 13. PROMOS (parent table)
-- ============================================================
CREATE TABLE promos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  -- CHANGE 5: Truncate columns
  /*start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  available_amt INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,*/
  promo_type  ENUM('Freebie', 'Markdown') NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 14. FREEBIES (child of promos)
-- ============================================================
CREATE TABLE freebies (
  -- CHANGE 6: Truncate id and other columns, change promo_id to PRIMARY KEY
  --id              INT AUTO_INCREMENT PRIMARY KEY,
  --promo_id        INT NOT NULL,
  id              INT PRIMARY KEY,
  --product_id      INT NOT NULL,               -- product that triggers the freebie
  --freebie_product_id INT NOT NULL,            -- the free product given
  min_quantity    INT NOT NULL DEFAULT 1,      -- min qty to qualify
  freebie_qty     INT NOT NULL DEFAULT 1,      -- qty of freebie given
  --FOREIGN KEY (promo_id) REFERENCES promos(id) ON DELETE CASCADE,
  --FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  --FOREIGN KEY (freebie_product_id) REFERENCES products(id) ON DELETE CASCADE
  FOREIGN KEY (id) REFERENCES promos(id) ON DELETE CASCADE,
  CONSTRAINT 
) ENGINE=InnoDB;

-- ============================================================
-- 15. MARKDOWNS (child of promos)
-- ============================================================
CREATE TABLE markdowns (
  -- CHANGE 7: Truncate id and other columns, change promo_id to PRIMARY KEY
  --id              INT AUTO_INCREMENT PRIMARY KEY,
  id              INT PRIMARY KEY,
  --promo_id        INT NOT NULL,
  --product_id      INT,                         -- NULL = applies to category
  --category        ENUM('Ceramic', 'Porcelain', 'Glass', 'Natural Stone', 'Decorative'),
  discount_type   ENUM('Percentage', 'Fixed') NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,      -- e.g. 20 for 20% or 100 for PHP 100 off
  --FOREIGN KEY (promo_id) REFERENCES promos(id) ON DELETE CASCADE,
  --FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  FOREIGN KEY (id) REFERENCES promos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 16. EMAIL NOTIFICATIONS LOG (FR-48 through FR-52)
-- ============================================================
CREATE TABLE email_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  recipient   VARCHAR(255) NOT NULL,
  subject     VARCHAR(255) NOT NULL,
  body        TEXT,
  status      ENUM('Sent', 'Failed', 'Pending') NOT NULL DEFAULT 'Pending',
  sent_at     TIMESTAMP NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

USE tilematch_db;
ALTER TABLE products MODIFY COLUMN image_url LONGTEXT;
