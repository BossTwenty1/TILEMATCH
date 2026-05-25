-- 1. Lookups & Addresses
CREATE TABLE municipality (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL
);

CREATE TABLE barangay (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipality_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT fk_barangay_municipality FOREIGN KEY (municipality_id) 
        REFERENCES municipality(id) ON DELETE RESTRICT
);

CREATE TABLE address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barangay_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    CONSTRAINT fk_address_barangay FOREIGN KEY (barangay_id) 
        REFERENCES barangay(id) ON DELETE RESTRICT
);

-- 2. Core Users & Suppliers
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_address FOREIGN KEY (address_id) 
        REFERENCES address(id) ON DELETE RESTRICT
);

CREATE TABLE supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT
);

-- 3. Core Catalog & Inventory
CREATE TABLE product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_family INT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    supplier_id INT NOT NULL,
    material VARCHAR(100),
    color VARCHAR(50),
    category VARCHAR(100),
    size VARCHAR(50),
    room_application VARCHAR(100),
    image_url TEXT,
    sold_count INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_supplier FOREIGN KEY (supplier_id) 
        REFERENCES supplier(id) ON DELETE RESTRICT
);

CREATE TABLE product_images (
    product_id INT NOT NULL,
    img_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) 
        REFERENCES product(id) ON DELETE RESTRICT
);

CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    quantity INT DEFAULT 0,
    possible_loss INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) 
        REFERENCES product(id) ON DELETE RESTRICT
);

-- 4. Cart Subsystem
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE cart_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) 
        REFERENCES cart(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cart_item_product FOREIGN KEY (item_id) 
        REFERENCES product(id) ON DELETE RESTRICT
);

-- 5. Orders & Financials
CREATE TABLE `order` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    delivery_address TEXT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_total DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_delivery BOOLEAN DEFAULT TRUE,
    est_delivery DATE,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) 
        REFERENCES `order`(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) 
        REFERENCES product(id) ON DELETE RESTRICT
);

CREATE TABLE payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    payment_ref VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    paid_at TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) 
        REFERENCES `order`(id) ON DELETE RESTRICT
);

CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    revenue DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_order FOREIGN KEY (order_id) 
        REFERENCES `order`(id) ON DELETE RESTRICT
);

-- 6. Promos, Markdowns & Adjustments
CREATE TABLE promo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amt_to_buy INT NOT NULL DEFAULT 1,
    promo_type VARCHAR(100) NOT NULL
);

CREATE TABLE freebie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amt_to_buy INT NOT NULL DEFAULT 1,
    amt_to_give INT NOT NULL DEFAULT 1
);

CREATE TABLE product_promos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promo_id INT NOT NULL,
    product_id INT NOT NULL,
    freebie_product_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_promos_promo FOREIGN KEY (promo_id) 
        REFERENCES promo(id) ON DELETE RESTRICT,
    CONSTRAINT fk_promos_product FOREIGN KEY (product_id) 
        REFERENCES product(id) ON DELETE RESTRICT,
    CONSTRAINT fk_promos_freebie_product FOREIGN KEY (freebie_product_id) 
        REFERENCES product(id) ON DELETE RESTRICT
);

CREATE TABLE markdown (
    id INT AUTO_INCREMENT PRIMARY KEY,
    markdown_type VARCHAR(100) NOT NULL,
    markdown_amt DECIMAL(10, 2) NOT NULL,
    scope VARCHAR(100) NOT NULL
);

CREATE TABLE losses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    loss_amt DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_losses_product FOREIGN KEY (product_id) 
        REFERENCES product(id) ON DELETE RESTRICT
);