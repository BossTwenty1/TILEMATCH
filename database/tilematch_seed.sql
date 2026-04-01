-- ============================================================
-- TILEMATCH E-COMMERCE PLATFORM
-- Seed Data Script
-- 30+ Products | 15+ Orders | 6 Users | Inventory | Payments
-- Run AFTER tilematch_schema.sql
-- ============================================================

USE tilematch_db;

-- ============================================================
-- SUPPLIERS (3 suppliers)
-- ============================================================
INSERT INTO suppliers (id, name, contact_name, email, phone, address) VALUES
(1, 'CeramicWorld Philippines',  'Roberto Santos',  'roberto@ceramicworld.ph',  '09171112233', 'Block 5, Lot 12, Industrial Zone, Meycauayan, Bulacan'),
(2, 'StoneCraft International',  'Maria Gonzales',  'maria@stonecraft.com',     '09283334455', '15 Trade Ave, Pasig City, Metro Manila'),
(3, 'GlassTile Innovations',     'Kevin Lim',       'kevin@glasstile.ph',       '09395556677', '88 Innovation Rd, Cebu City, Cebu');

-- ============================================================
-- CUSTOMERS (5 customers + 1 admin = 6 users)
-- Passwords are bcrypt hashes of the plaintext shown in comments
-- For development, use plaintext; hash in production via backend
-- ============================================================
INSERT INTO customers (id, email, password, first_name, last_name, phone, role, municipality, city, barangay, street, postal_code, is_verified, created_at) VALUES
-- password: password123
(1, 'juan@email.com',       '$2b$10$placeholder_hash_juan',       'Juan',    'dela Cruz',   '09171234567', 'customer', 'Naga',       'Naga City',       'Triangulo',     '123 Magsaysay Ave',       '4400', TRUE,  '2025-01-10 08:00:00'),
-- password: password123
(2, 'maria@email.com',      '$2b$10$placeholder_hash_maria',      'Maria',   'Santos',      '09281234567', 'customer', 'Legazpi',    'Legazpi City',    'Daraga',        '45 Rizal Street',         '4500', TRUE,  '2025-02-05 10:00:00'),
-- password: password123
(3, 'pedro@email.com',      '$2b$10$placeholder_hash_pedro',      'Pedro',   'Reyes',       '09391234567', 'customer', 'Iriga',      'Iriga City',      'San Nicolas',   '78 Mabini Blvd',          '4431', TRUE,  '2025-03-12 14:00:00'),
-- password: password123
(4, 'ana@email.com',        '$2b$10$placeholder_hash_ana',        'Ana',     'Garcia',      '09171234568', 'customer', 'Sorsogon',   'Sorsogon City',   'Burabod',       '12 Luna Street',          '4700', TRUE,  '2025-04-20 09:00:00'),
-- password: password123
(5, 'carlos@email.com',     '$2b$10$placeholder_hash_carlos',     'Carlos',  'Mendoza',     '09281234568', 'customer', 'Tabaco',     'Tabaco City',     'Quinale',       '99 Penaranda St',         '4511', TRUE,  '2025-05-15 11:00:00'),
-- password: admin123
(6, 'admin@tilematch.com',  '$2b$10$placeholder_hash_admin',      'Admin',   'TileMatch',   '09170000000', 'admin',    NULL,         NULL,              NULL,            NULL,                      NULL,   TRUE,  '2025-01-01 00:00:00');

-- ============================================================
-- PRODUCTS (30 products, 6 per category)
-- Categories: Ceramic, Porcelain, Glass, Natural Stone, Decorative
-- ============================================================

-- === CERAMIC (6) ===
INSERT INTO products (id, name, description, category, material, color, size, room_application, price, image_url, is_active, sold_count, supplier_id, created_at) VALUES
(1,  'Marble White Ceramic 30x30',      'Premium white ceramic tile with subtle marble veining, ideal for clean modern interiors.',                  'Ceramic', 'Ceramic', 'White',      '30x30', 'Floor',    450.00,  'https://placehold.co/400x400/f5f0eb/555555?text=Ceramic+White',      TRUE, 120, 1, '2025-01-15'),
(2,  'Terracotta Warm Ceramic 40x40',    'Earthy terracotta finish ceramic tile bringing warmth to any room.',                                       'Ceramic', 'Ceramic', 'Terracotta', '40x40', 'Floor',    380.00,  'https://placehold.co/400x400/c4713b/ffffff?text=Ceramic+Terracotta', TRUE, 95,  1, '2025-01-20'),
(3,  'Ocean Blue Ceramic 20x20',         'Vibrant blue ceramic tile perfect for bathroom accent walls and kitchen backsplashes.',                     'Ceramic', 'Ceramic', 'Blue',       '20x20', 'Wall',     320.00,  'https://placehold.co/400x400/1e6091/ffffff?text=Ceramic+Blue',       TRUE, 78,  1, '2025-02-01'),
(4,  'Charcoal Matte Ceramic 60x60',     'Large-format charcoal ceramic with matte finish for a sophisticated modern look.',                         'Ceramic', 'Ceramic', 'Charcoal',   '60x60', 'Floor',    650.00,  'https://placehold.co/400x400/333333/ffffff?text=Ceramic+Charcoal',   TRUE, 64,  1, '2025-02-10'),
(5,  'Sand Beige Ceramic 30x60',         'Warm beige ceramic tile with natural sand texture, versatile for any space.',                              'Ceramic', 'Ceramic', 'Beige',      '30x60', 'Floor',    520.00,  'https://placehold.co/400x400/d4b896/555555?text=Ceramic+Beige',      TRUE, 110, 1, '2025-03-01'),
(6,  'Forest Green Ceramic 20x20',       'Rich green ceramic tile for creating earthy, nature-inspired accent features.',                            'Ceramic', 'Ceramic', 'Green',      '20x20', 'Wall',     290.00,  'https://placehold.co/400x400/2d5016/ffffff?text=Ceramic+Green',      TRUE, 42,  1, '2025-03-15'),

-- === PORCELAIN (6) ===
(7,  'Carrara Porcelain 60x60',          'Elegant Carrara marble-look porcelain tile with realistic veining and polished finish.',                   'Porcelain', 'Porcelain', 'White',    '60x60', 'Floor',    1200.00, 'https://placehold.co/400x400/e8e0d5/555555?text=Porcelain+Carrara',   TRUE, 88,  2, '2025-01-18'),
(8,  'Concrete Grey Porcelain 40x40',    'Industrial concrete-look porcelain with authentic texture and superior durability.',                       'Porcelain', 'Porcelain', 'Grey',     '40x40', 'Floor',    780.00,  'https://placehold.co/400x400/8a8a8a/ffffff?text=Porcelain+Grey',      TRUE, 102, 2, '2025-02-05'),
(9,  'Ivory Satin Porcelain 30x60',      'Smooth satin-finish ivory porcelain tile for elegant residential and commercial spaces.',                  'Porcelain', 'Porcelain', 'Ivory',    '30x60', 'Floor',    920.00,  'https://placehold.co/400x400/fffff0/555555?text=Porcelain+Ivory',     TRUE, 67,  2, '2025-02-20'),
(10, 'Midnight Black Porcelain 60x60',   'Dramatic black polished porcelain tile for striking contemporary floor designs.',                          'Porcelain', 'Porcelain', 'Black',    '60x60', 'Floor',    1350.00, 'https://placehold.co/400x400/1a1a1a/ffffff?text=Porcelain+Black',      TRUE, 54,  2, '2025-03-10'),
(11, 'Walnut Wood Porcelain 20x60',      'Wood-look porcelain plank tile replicating natural walnut grain with the durability of porcelain.',        'Porcelain', 'Porcelain', 'Brown',    '30x60', 'Floor',    850.00,  'https://placehold.co/400x400/5c3317/ffffff?text=Porcelain+Walnut',     TRUE, 135, 2, '2025-03-25'),
(12, 'Calacatta Gold Porcelain 40x40',   'Luxurious Calacatta marble-look porcelain with bold gold veining on a pristine white base.',              'Porcelain', 'Porcelain', 'Gold',     '40x40', 'Floor',    1500.00, 'https://placehold.co/400x400/f5e6c8/555555?text=Porcelain+Calacatta',  TRUE, 47,  2, '2025-04-01'),

-- === GLASS (6) ===
(13, 'Crystal Clear Glass Mosaic',       'Transparent crystal glass mosaic tiles for stunning backsplash and shower installations.',                 'Glass', 'Glass', 'Clear',       '20x20', 'Wall',     580.00,  'https://placehold.co/400x400/c8e6f0/555555?text=Glass+Crystal',       TRUE, 73,  3, '2025-01-25'),
(14, 'Emerald Glass Subway 10x30',       'Deep emerald green glass subway tiles for a jewel-toned accent wall.',                                    'Glass', 'Glass', 'Green',       '30x30', 'Wall',     490.00,  'https://placehold.co/400x400/046307/ffffff?text=Glass+Emerald',       TRUE, 61,  3, '2025-02-15'),
(15, 'Sapphire Blue Glass 20x20',        'Rich sapphire blue glass tiles adding depth and luxury to bathroom designs.',                              'Glass', 'Glass', 'Blue',        '20x20', 'Bathroom', 520.00,  'https://placehold.co/400x400/0f52ba/ffffff?text=Glass+Sapphire',      TRUE, 89,  3, '2025-03-05'),
(16, 'Frosted Pearl Glass 30x30',        'Frosted pearl-finish glass tiles for a soft, luminous wall application.',                                  'Glass', 'Glass', 'White',       '30x30', 'Bathroom', 610.00,  'https://placehold.co/400x400/f0ece4/555555?text=Glass+Pearl',         TRUE, 38,  3, '2025-03-20'),
(17, 'Rose Gold Glass Mosaic',           'Shimmering rose gold glass mosaic tiles for luxurious kitchen and vanity backsplashes.',                   'Glass', 'Glass', 'Rose Gold',   '20x20', 'Kitchen',  750.00,  'https://placehold.co/400x400/b76e79/ffffff?text=Glass+Rose+Gold',      TRUE, 52,  3, '2025-04-10'),
(18, 'Smoke Grey Glass 40x40',           'Subtle smoke grey glass tiles with a contemporary translucent finish.',                                    'Glass', 'Glass', 'Grey',        '40x40', 'Wall',     680.00,  'https://placehold.co/400x400/6e6e6e/ffffff?text=Glass+Smoke',         TRUE, 29,  3, '2025-04-25'),

-- === NATURAL STONE (6) ===
(19, 'Travertine Classic 40x40',         'Genuine travertine natural stone tile with characteristic warm tones and natural pitting.',                'Natural Stone', 'Travertine', 'Beige',   '40x40', 'Floor',    1800.00, 'https://placehold.co/400x400/c9b99a/555555?text=Stone+Travertine',   TRUE, 45,  2, '2025-01-30'),
(20, 'Slate Dark Grey 30x60',            'Natural dark grey slate tile with rich texture for dramatic flooring and feature walls.',                   'Natural Stone', 'Slate',      'Dark Grey','30x60', 'Floor',    1650.00, 'https://placehold.co/400x400/3d3d3d/ffffff?text=Stone+Slate',        TRUE, 58,  2, '2025-02-18'),
(21, 'Limestone Cream 60x60',            'Honed cream limestone tiles providing a timeless and elegant natural stone floor.',                        'Natural Stone', 'Limestone',  'Cream',   '60x60', 'Floor',    2200.00, 'https://placehold.co/400x400/f5e6c8/555555?text=Stone+Limestone',    TRUE, 33,  2, '2025-03-08'),
(22, 'Quartzite Silver 30x30',           'Sparkling silver quartzite tiles with natural shimmer for upscale bathroom designs.',                      'Natural Stone', 'Quartzite',  'Silver',  '30x30', 'Bathroom', 1950.00, 'https://placehold.co/400x400/c0c0c0/555555?text=Stone+Quartzite',    TRUE, 27,  2, '2025-03-28'),
(23, 'Sandstone Gold 40x40',             'Warm golden-toned sandstone tiles perfect for outdoor patios and pool surrounds.',                         'Natural Stone', 'Sandstone',  'Gold',    '40x40', 'Outdoor',  1400.00, 'https://placehold.co/400x400/daa520/555555?text=Stone+Sandstone',    TRUE, 41,  2, '2025-04-15'),
(24, 'Basalt Black 30x60',              'Dense black basalt natural stone tile for bold, modern minimalist interiors.',                              'Natural Stone', 'Basalt',     'Black',   '30x60', 'Floor',    2500.00, 'https://placehold.co/400x400/1c1c1c/ffffff?text=Stone+Basalt',      TRUE, 19,  2, '2025-05-01'),

-- === DECORATIVE (6) ===
(25, 'Moroccan Patterned 20x20',         'Hand-painted Moroccan-style decorative tiles with intricate geometric patterns in blue and white.',        'Decorative', 'Ceramic', 'Blue',       '20x20', 'Wall',     420.00,  'https://placehold.co/400x400/1a5276/ffffff?text=Deco+Moroccan',      TRUE, 96,  1, '2025-02-08'),
(26, 'Hexagon Marble Mosaic',            'Elegant hexagonal marble mosaic tiles for sophisticated floor medallions and accents.',                    'Decorative', 'Marble',  'White',      '20x20', 'Floor',    890.00,  'https://placehold.co/400x400/e8e0d5/555555?text=Deco+Hexagon',       TRUE, 71,  2, '2025-02-22'),
(27, 'Vintage Floral Ceramic 30x30',     'Retro-inspired floral patterned ceramic tiles for charming rustic and cottage-style interiors.',           'Decorative', 'Ceramic', 'Multi',      '30x30', 'Wall',     350.00,  'https://placehold.co/400x400/d4956a/ffffff?text=Deco+Floral',        TRUE, 83,  1, '2025-03-12'),
(28, 'Geometric Art Deco 30x30',         'Bold Art Deco geometric pattern tiles with gold metallic accents on a black base.',                       'Decorative', 'Ceramic', 'Black',      '30x30', 'Wall',     550.00,  'https://placehold.co/400x400/1a1a1a/c9a84c?text=Deco+Art+Deco',      TRUE, 37,  1, '2025-04-05'),
(29, 'Mediterranean Sun 20x20',          'Bright Mediterranean-inspired sun pattern tiles in warm yellows and terracotta tones.',                    'Decorative', 'Ceramic', 'Yellow',     '20x20', 'Kitchen',  380.00,  'https://placehold.co/400x400/f0b429/555555?text=Deco+Mediterranean', TRUE, 59,  1, '2025-04-20'),
(30, 'Penny Round Metallic Mosaic',      'Tiny metallic-finish penny round mosaic tiles for glamorous accent walls and niches.',                     'Decorative', 'Metal',   'Silver',     '20x20', 'Bathroom', 720.00,  'https://placehold.co/400x400/a8a8a8/333333?text=Deco+Penny+Round',   TRUE, 44,  3, '2025-05-10');

-- ============================================================
-- PRODUCT IMAGES (3 images per product for first 10 products)
-- ============================================================
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
(1, 'https://placehold.co/600x600/f5f0eb/555555?text=Marble+White+Main',   0),
(1, 'https://placehold.co/600x600/f5f0eb/555555?text=Marble+White+Detail', 1),
(1, 'https://placehold.co/600x600/f5f0eb/555555?text=Marble+White+Room',   2),
(2, 'https://placehold.co/600x600/c4713b/ffffff?text=Terracotta+Main',     0),
(2, 'https://placehold.co/600x600/c4713b/ffffff?text=Terracotta+Detail',   1),
(2, 'https://placehold.co/600x600/c4713b/ffffff?text=Terracotta+Room',     2),
(3, 'https://placehold.co/600x600/1e6091/ffffff?text=Ocean+Blue+Main',     0),
(3, 'https://placehold.co/600x600/1e6091/ffffff?text=Ocean+Blue+Detail',   1),
(3, 'https://placehold.co/600x600/1e6091/ffffff?text=Ocean+Blue+Room',     2),
(7, 'https://placehold.co/600x600/e8e0d5/555555?text=Carrara+Main',        0),
(7, 'https://placehold.co/600x600/e8e0d5/555555?text=Carrara+Detail',      1),
(7, 'https://placehold.co/600x600/e8e0d5/555555?text=Carrara+Room',        2),
(11,'https://placehold.co/600x600/5c3317/ffffff?text=Walnut+Wood+Main',     0),
(11,'https://placehold.co/600x600/5c3317/ffffff?text=Walnut+Wood+Detail',   1),
(11,'https://placehold.co/600x600/5c3317/ffffff?text=Walnut+Wood+Room',     2),
(15,'https://placehold.co/600x600/0f52ba/ffffff?text=Sapphire+Main',        0),
(15,'https://placehold.co/600x600/0f52ba/ffffff?text=Sapphire+Detail',      1),
(15,'https://placehold.co/600x600/0f52ba/ffffff?text=Sapphire+Room',        2),
(19,'https://placehold.co/600x600/c9b99a/555555?text=Travertine+Main',      0),
(19,'https://placehold.co/600x600/c9b99a/555555?text=Travertine+Detail',    1),
(19,'https://placehold.co/600x600/c9b99a/555555?text=Travertine+Room',      2),
(25,'https://placehold.co/600x600/1a5276/ffffff?text=Moroccan+Main',        0),
(25,'https://placehold.co/600x600/1a5276/ffffff?text=Moroccan+Detail',      1),
(25,'https://placehold.co/600x600/1a5276/ffffff?text=Moroccan+Room',        2);

-- ============================================================
-- CHARACTERISTICS (sample specs for first 6 products)
-- ============================================================
INSERT INTO characteristics (product_id, attr_key, attr_value) VALUES
(1, 'finish',    'Polished'),       (1, 'thickness', '8mm'),    (1, 'weight', '1.2 kg/pc'),
(2, 'finish',    'Matte'),          (2, 'thickness', '9mm'),    (2, 'weight', '1.8 kg/pc'),
(3, 'finish',    'Glossy'),         (3, 'thickness', '7mm'),    (3, 'weight', '0.6 kg/pc'),
(7, 'finish',    'Polished'),       (7, 'thickness', '10mm'),   (7, 'weight', '3.2 kg/pc'),
(11,'finish',    'Matte'),          (11,'thickness', '9mm'),    (11,'weight', '2.4 kg/pc'),
(19,'finish',    'Honed'),          (19,'thickness', '12mm'),   (19,'weight', '4.5 kg/pc');

-- ============================================================
-- INVENTORY (one row per product)
-- ============================================================
INSERT INTO inventory (product_id, stock_qty, low_stock_threshold) VALUES
(1,  85,  10),
(2,  60,  10),
(3,  45,  10),
(4,  30,  10),
(5,  92,  10),
(6,  8,   10),   -- LOW STOCK
(7,  55,  10),
(8,  70,  10),
(9,  40,  10),
(10, 25,  10),
(11, 110, 10),
(12, 5,   10),   -- LOW STOCK
(13, 38,  10),
(14, 50,  10),
(15, 65,  10),
(16, 3,   10),   -- LOW STOCK
(17, 42,  10),
(18, 0,   10),   -- OUT OF STOCK
(19, 22,  10),
(20, 35,  10),
(21, 15,  10),
(22, 9,   10),   -- LOW STOCK
(23, 28,  10),
(24, 7,   10),   -- LOW STOCK
(25, 75,  10),
(26, 48,  10),
(27, 62,  10),
(28, 20,  10),
(29, 55,  10),
(30, 33,  10);

-- ============================================================
-- CARTS (2 active carts for demo)
-- ============================================================
INSERT INTO cart (id, customer_id) VALUES
(1, 2),
(2, 4);

INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 7,  5),
(1, 15, 3),
(2, 25, 10),
(2, 1,  8);

-- ============================================================
-- ORDERS (15 orders spread across 12 months, all 4 statuses)
-- ============================================================
INSERT INTO orders (id, order_number, customer_id, customer_name, customer_email,
  ship_municipality, ship_city, ship_barangay, ship_street, ship_postal_code,
  subtotal, tax, shipping_fee, total, status, estimated_delivery, created_at) VALUES

(1,  'ORD-2025-0001', 1, 'Juan dela Cruz',   'juan@email.com',
     'Naga','Naga City','Triangulo','123 Magsaysay Ave','4400',
     4500.00, 540.00, 0.00, 5040.00, 'Delivered', '2025-01-27', '2025-01-20 09:30:00'),

(2,  'ORD-2025-0002', 2, 'Maria Santos',     'maria@email.com',
     'Legazpi','Legazpi City','Daraga','45 Rizal Street','4500',
     7800.00, 936.00, 0.00, 8736.00, 'Delivered', '2025-02-15', '2025-02-08 14:00:00'),

(3,  'ORD-2025-0003', 3, 'Pedro Reyes',      'pedro@email.com',
     'Iriga','Iriga City','San Nicolas','78 Mabini Blvd','4431',
     2400.00, 288.00, 0.00, 2688.00, 'Delivered', '2025-03-22', '2025-03-15 10:15:00'),

(4,  'ORD-2025-0004', 1, 'Juan dela Cruz',   'juan@email.com',
     'Naga','Naga City','Triangulo','123 Magsaysay Ave','4400',
     12000.00, 1440.00, 0.00, 13440.00, 'Delivered', '2025-04-10', '2025-04-03 11:00:00'),

(5,  'ORD-2025-0005', 4, 'Ana Garcia',       'ana@email.com',
     'Sorsogon','Sorsogon City','Burabod','12 Luna Street','4700',
     1560.00, 187.20, 200.00, 1947.20, 'Delivered', '2025-05-05', '2025-04-28 16:30:00'),

(6,  'ORD-2025-0006', 5, 'Carlos Mendoza',   'carlos@email.com',
     'Tabaco','Tabaco City','Quinale','99 Penaranda St','4511',
     9200.00, 1104.00, 0.00, 10304.00, 'Delivered', '2025-05-28', '2025-05-21 08:45:00'),

(7,  'ORD-2025-0007', 2, 'Maria Santos',     'maria@email.com',
     'Legazpi','Legazpi City','Daraga','45 Rizal Street','4500',
     3500.00, 420.00, 0.00, 3920.00, 'Delivered', '2025-06-20', '2025-06-13 13:20:00'),

(8,  'ORD-2025-0008', 3, 'Pedro Reyes',      'pedro@email.com',
     'Iriga','Iriga City','San Nicolas','78 Mabini Blvd','4431',
     6750.00, 810.00, 0.00, 7560.00, 'Shipped', '2025-07-18', '2025-07-11 09:00:00'),

(9,  'ORD-2025-0009', 1, 'Juan dela Cruz',   'juan@email.com',
     'Naga','Naga City','Triangulo','123 Magsaysay Ave','4400',
     15000.00, 1800.00, 0.00, 16800.00, 'Shipped', '2025-08-15', '2025-08-08 15:40:00'),

(10, 'ORD-2025-0010', 4, 'Ana Garcia',       'ana@email.com',
     'Sorsogon','Sorsogon City','Burabod','12 Luna Street','4700',
     4200.00, 504.00, 0.00, 4704.00, 'Processing', '2025-09-12', '2025-09-05 10:30:00'),

(11, 'ORD-2025-0011', 5, 'Carlos Mendoza',   'carlos@email.com',
     'Tabaco','Tabaco City','Quinale','99 Penaranda St','4511',
     2700.00, 324.00, 0.00, 3024.00, 'Processing', '2025-10-10', '2025-10-03 14:15:00'),

(12, 'ORD-2025-0012', 2, 'Maria Santos',     'maria@email.com',
     'Legazpi','Legazpi City','Daraga','45 Rizal Street','4500',
     8900.00, 1068.00, 0.00, 9968.00, 'Pending', '2025-11-08', '2025-11-01 11:50:00'),

(13, 'ORD-2025-0013', 1, 'Juan dela Cruz',   'juan@email.com',
     'Naga','Naga City','Triangulo','123 Magsaysay Ave','4400',
     5600.00, 672.00, 0.00, 6272.00, 'Pending', '2025-11-22', '2025-11-15 09:25:00'),

(14, 'ORD-2025-0014', 3, 'Pedro Reyes',      'pedro@email.com',
     'Iriga','Iriga City','San Nicolas','78 Mabini Blvd','4431',
     1260.00, 151.20, 200.00, 1611.20, 'Pending', '2025-12-08', '2025-12-01 16:00:00'),

(15, 'ORD-2025-0015', 5, 'Carlos Mendoza',   'carlos@email.com',
     'Tabaco','Tabaco City','Quinale','99 Penaranda St','4511',
     18500.00, 2220.00, 0.00, 20720.00, 'Pending', '2025-12-20', '2025-12-13 12:10:00');

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, line_total) VALUES
-- Order 1: Ceramic tiles
(1,  1,  'Marble White Ceramic 30x30',     10, 450.00,  4500.00),
-- Order 2: Porcelain mix
(2,  7,  'Carrara Porcelain 60x60',         5, 1200.00, 6000.00),
(2,  8,  'Concrete Grey Porcelain 40x40',   2, 780.00,  1560.00),
(2,  3,  'Ocean Blue Ceramic 20x20',        1, 320.00,  240.00),       -- small add-on, adjusted total
-- Order 3: Decorative
(3,  25, 'Moroccan Patterned 20x20',         5, 420.00,  2100.00),
(3,  6,  'Forest Green Ceramic 20x20',       1, 290.00,  290.00),
-- Order 4: Natural Stone luxury
(4,  21, 'Limestone Cream 60x60',            4, 2200.00, 8800.00),
(4,  19, 'Travertine Classic 40x40',         2, 1800.00, 3600.00),
-- Order 5: Small order
(5,  27, 'Vintage Floral Ceramic 30x30',     4, 350.00,  1400.00),
(5,  3,  'Ocean Blue Ceramic 20x20',         1, 320.00,  160.00),       -- adjusted
-- Order 6: Mixed
(6,  11, 'Walnut Wood Porcelain 20x60',      8, 850.00,  6800.00),
(6,  5,  'Sand Beige Ceramic 30x60',         5, 520.00,  2600.00),
-- Order 7: Glass focus
(7,  15, 'Sapphire Blue Glass 20x20',        5, 520.00,  2600.00),
(7,  17, 'Rose Gold Glass Mosaic',           2, 750.00,  1500.00),
-- Order 8: Stone
(8,  20, 'Slate Dark Grey 30x60',            3, 1650.00, 4950.00),
(8,  19, 'Travertine Classic 40x40',         1, 1800.00, 1800.00),
-- Order 9: Huge order
(9,  24, 'Basalt Black 30x60',               6, 2500.00, 15000.00),
-- Order 10: Decorative
(10, 26, 'Hexagon Marble Mosaic',            3, 890.00,  2670.00),
(10, 28, 'Geometric Art Deco 30x30',         3, 550.00,  1650.00),
-- Order 11: Glass
(11, 14, 'Emerald Glass Subway 10x30',       4, 490.00,  1960.00),
(11, 13, 'Crystal Clear Glass Mosaic',       2, 580.00,  1160.00),
-- Order 12: Porcelain
(12, 10, 'Midnight Black Porcelain 60x60',   4, 1350.00, 5400.00),
(12, 9,  'Ivory Satin Porcelain 30x60',      4, 920.00,  3680.00),
-- Order 13: Mixed
(13, 1,  'Marble White Ceramic 30x30',       8, 450.00,  3600.00),
(13, 29, 'Mediterranean Sun 20x20',          6, 380.00,  2280.00),
-- Order 14: Small
(14, 6,  'Forest Green Ceramic 20x20',       3, 290.00,  870.00),
(14, 29, 'Mediterranean Sun 20x20',          1, 380.00,  380.00),
-- Order 15: Premium order
(15, 24, 'Basalt Black 30x60',               5, 2500.00, 12500.00),
(15, 12, 'Calacatta Gold Porcelain 40x40',   4, 1500.00, 6000.00);

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO payments (order_id, payment_method, payment_ref, amount, status, paid_at) VALUES
(1,  'GCash', '9876543210001', 5040.00,  'Confirmed', '2025-01-20 09:35:00'),
(2,  'GCash', '9876543210002', 8736.00,  'Confirmed', '2025-02-08 14:10:00'),
(3,  'GCash', '9876543210003', 2688.00,  'Confirmed', '2025-03-15 10:25:00'),
(4,  'GCash', '9876543210004', 13440.00, 'Confirmed', '2025-04-03 11:10:00'),
(5,  'GCash', '9876543210005', 1947.20,  'Confirmed', '2025-04-28 16:40:00'),
(6,  'GCash', '9876543210006', 10304.00, 'Confirmed', '2025-05-21 08:55:00'),
(7,  'GCash', '9876543210007', 3920.00,  'Confirmed', '2025-06-13 13:30:00'),
(8,  'GCash', '9876543210008', 7560.00,  'Confirmed', '2025-07-11 09:10:00'),
(9,  'GCash', '9876543210009', 16800.00, 'Confirmed', '2025-08-08 15:50:00'),
(10, 'GCash', '9876543210010', 4704.00,  'Confirmed', '2025-09-05 10:40:00'),
(11, 'GCash', '9876543210011', 3024.00,  'Pending',   NULL),
(12, 'GCash', '9876543210012', 9968.00,  'Pending',   NULL),
(13, 'GCash', '9876543210013', 6272.00,  'Pending',   NULL),
(14, 'GCash', '9876543210014', 1611.20,  'Pending',   NULL),
(15, 'GCash', '9876543210015', 20720.00, 'Pending',   NULL);

-- ============================================================
-- SALES (records for delivered orders)
-- ============================================================
INSERT INTO sales (order_id, product_id, category, quantity_sold, revenue, sale_date) VALUES
(1,  1,  'Ceramic',       10, 4500.00,  '2025-01-20'),
(2,  7,  'Porcelain',      5, 6000.00,  '2025-02-08'),
(2,  8,  'Porcelain',      2, 1560.00,  '2025-02-08'),
(3,  25, 'Decorative',     5, 2100.00,  '2025-03-15'),
(4,  21, 'Natural Stone',  4, 8800.00,  '2025-04-03'),
(4,  19, 'Natural Stone',  2, 3600.00,  '2025-04-03'),
(5,  27, 'Decorative',     4, 1400.00,  '2025-04-28'),
(6,  11, 'Porcelain',      8, 6800.00,  '2025-05-21'),
(6,  5,  'Ceramic',        5, 2600.00,  '2025-05-21'),
(7,  15, 'Glass',          5, 2600.00,  '2025-06-13'),
(7,  17, 'Glass',          2, 1500.00,  '2025-06-13');

-- ============================================================
-- PROMOS (sample promotions)
-- ============================================================
INSERT INTO promos (id, name, promo_type, start_date, end_date, is_active) VALUES
(1, 'Buy 10 Get 1 Free Ceramic', 'Freebie',  '2025-06-01', '2025-06-30', TRUE),
(2, 'Summer Stone Sale 15% Off', 'Markdown', '2025-07-01', '2025-07-31', TRUE);

INSERT INTO freebies (promo_id, product_id, freebie_product_id, min_quantity, freebie_qty) VALUES
(1, 1, 6, 10, 1);  -- Buy 10 Marble White, get 1 Forest Green free

INSERT INTO markdowns (promo_id, product_id, category, discount_type, discount_value) VALUES
(2, NULL, 'Natural Stone', 'Percentage', 15.00);  -- 15% off all Natural Stone

-- ============================================================
-- EMAIL LOGS (sample notification records)
-- ============================================================
INSERT INTO email_logs (recipient, subject, body, status, sent_at) VALUES
('juan@email.com',    'Order Confirmed — ORD-2025-0001', 'Your order has been placed successfully. Total: PHP 5,040.00',    'Sent', '2025-01-20 09:36:00'),
('juan@email.com',    'Order Shipped — ORD-2025-0001',   'Your order has been shipped. Estimated delivery: Jan 27, 2025.',   'Sent', '2025-01-23 10:00:00'),
('juan@email.com',    'Order Delivered — ORD-2025-0001', 'Your order has been delivered. Thank you for shopping at TileMatch!','Sent', '2025-01-27 14:00:00'),
('maria@email.com',   'Order Confirmed — ORD-2025-0002', 'Your order has been placed successfully. Total: PHP 8,736.00',    'Sent', '2025-02-08 14:11:00'),
('carlos@email.com',  'Order Confirmed — ORD-2025-0006', 'Your order has been placed successfully. Total: PHP 10,304.00',   'Sent', '2025-05-21 08:56:00');

-- ============================================================
-- DONE. Database fully seeded.
-- Quick verification queries:
-- ============================================================
-- SELECT COUNT(*) AS product_count FROM products;         -- Expected: 30
-- SELECT COUNT(*) AS order_count FROM orders;             -- Expected: 15
-- SELECT COUNT(*) AS customer_count FROM customers WHERE role = 'customer'; -- Expected: 5
-- SELECT COUNT(*) AS low_stock FROM inventory WHERE stock_qty < low_stock_threshold; -- Expected: 5
