-- CHANGE 1
ALTER TABLE customers 
    DROP COLUMN municipality, 
    DROP COLUMN city,
    DROP COLUMN barangay,
    DROP COLUMN street,
    DROP COLUMN postal_code;

-- CHANGE 2
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

-- CHANGE 3
ALTER TABLE orders 
    RENAME COLUMN ship_municipality TO delivery_municipality,
    RENAME COLUMN ship_city TO delivery_city,
    RENAME COLUMN ship_barangay TO delivery_barangay,
    RENAME COLUMN ship_street TO delivery_street,
    RENAME COLUMN ship_postal_code TO delivery_postal_code,
    RENAME COLUMN shipping_fee TO delivery_fee;

-- CHANGE 4
CREATE TABLE product_promo (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  product_id    INT,
  promo_id      INT NOT NULL,
  category      ENUM('Ceramic', 'Porcelain', 'Glass', 'Natural Stone', 'Decorative'),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  available_amt INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
  FOREIGN KEY (promo_id) REFERENCES promo(id) ON DELETE CASCADE,
  CONSTRAINT CHK_Product_XOR_Category CHECK ( 
    (product_id IS NULL AND category IS NOT NULL) 
    OR 
    (product_id IS NOT NULL AND category IS NULL) 
  )
) ENGINE=InnoDB;

-- CHANGE 5
ALTER TABLE promos
    DROP COLUMN start_date,
    DROP COLUMN end_date,
    DROP COLUMN available_amt,
    DROP COLUMN is_active;

-- CHANGE 6
ALTER TABLE freebies
    MODIFY COLUMN id INT PRIMARY KEY,
    DROP FOREIGN KEY freebies_ibfk_1;
    DROP COLUMN promo_id,
    DROP FOREIGN KEY freebies_ibfk_2;
    DROP COLUMN product_id,
    DROP FOREIGN KEY freebies_ibfk_3;
    DROP COLUMN freebie_product_id;

-- CHANGE 7
ALTER TABLE markdowns
    MODIFY COLUMN id INT PRIMARY KEY,
    DROP FOREIGN KEY x1,
    DROP COLUMN promo_id,
    DROP FOREIGN KEY x2,
    DROP COLUMN product_id,
    DROP COLUMN category;