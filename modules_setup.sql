
USE basketball_shop;

-- 1. Equipment table
-- Uses the existing categories(id) and brands(id) tables.
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(60) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipment_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_equipment_brand
        FOREIGN KEY (brand_id)
        REFERENCES brands(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 2. Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Supplier orders table
CREATE TABLE IF NOT EXISTS supplier_orders (
    supplier_order_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_date DATE,
    order_status ENUM(
        'draft',
        'placed',
        'partially_received',
        'received',
        'cancelled'
    ) NOT NULL DEFAULT 'draft',
    CONSTRAINT fk_supplier_orders_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 4. Supplier order items table
CREATE TABLE IF NOT EXISTS supplier_order_items (
    supplier_order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_order_id INT NOT NULL,
    equipment_id INT NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT chk_supplier_item_quantity CHECK (quantity > 0),
    CONSTRAINT fk_supplier_items_order
        FOREIGN KEY (supplier_order_id)
        REFERENCES supplier_orders(supplier_order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_supplier_items_equipment
        FOREIGN KEY (equipment_id)
        REFERENCES equipment(equipment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 5. Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_order_id INT NOT NULL,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    shipment_status ENUM(
        'pending',
        'shipped',
        'in_transit',
        'delayed',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    shipped_date DATE,
    expected_delivery DATE,
    delivered_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipments_supplier_order
        FOREIGN KEY (supplier_order_id)
        REFERENCES supplier_orders(supplier_order_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 6. Add sample categories if they do not exist
INSERT INTO categories (name)
SELECT 'Basketballs'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Basketballs'
);

INSERT INTO categories (name)
SELECT 'Footwear'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Footwear'
);

INSERT INTO categories (name)
SELECT 'Apparel'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Apparel'
);

INSERT INTO categories (name)
SELECT 'Accessories'
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Accessories'
);

-- 7. Add sample brands if they do not exist
INSERT INTO brands (name)
SELECT 'Nike'
WHERE NOT EXISTS (
    SELECT 1 FROM brands WHERE name = 'Nike'
);

INSERT INTO brands (name)
SELECT 'Adidas'
WHERE NOT EXISTS (
    SELECT 1 FROM brands WHERE name = 'Adidas'
);

INSERT INTO brands (name)
SELECT 'Wilson'
WHERE NOT EXISTS (
    SELECT 1 FROM brands WHERE name = 'Wilson'
);

INSERT INTO brands (name)
SELECT 'Spalding'
WHERE NOT EXISTS (
    SELECT 1 FROM brands WHERE name = 'Spalding'
);

INSERT INTO brands (name)
SELECT 'Under Armour'
WHERE NOT EXISTS (
    SELECT 1 FROM brands WHERE name = 'Under Armour'
);

-- 8. Add sample equipment
INSERT IGNORE INTO equipment
(product_name, sku, category_id, brand_id, stock_quantity)
SELECT
    'Evolution Game Basketball',
    'BALL-WIL-001',
    c.id,
    b.id,
    12
FROM categories c
JOIN brands b ON b.name = 'Wilson'
WHERE c.name = 'Basketballs';

INSERT IGNORE INTO equipment
(product_name, sku, category_id, brand_id, stock_quantity)
SELECT
    'Street Outdoor Basketball',
    'BALL-SPA-001',
    c.id,
    b.id,
    18
FROM categories c
JOIN brands b ON b.name = 'Spalding'
WHERE c.name = 'Basketballs';

INSERT IGNORE INTO equipment
(product_name, sku, category_id, brand_id, stock_quantity)
SELECT
    'Air Basketball Shoes',
    'SHOE-NIK-001',
    c.id,
    b.id,
    8
FROM categories c
JOIN brands b ON b.name = 'Nike'
WHERE c.name = 'Footwear';

-- 9. Add sample suppliers
INSERT INTO suppliers
(supplier_name, contact_person, email, phone)
SELECT
    'Sports Central Supplies',
    'Sales Team',
    'sales@sportscentral.example',
    '09170000001'
WHERE NOT EXISTS (
    SELECT 1 FROM suppliers
    WHERE supplier_name = 'Sports Central Supplies'
);

INSERT INTO suppliers
(supplier_name, contact_person, email, phone)
SELECT
    'Pro Court Distributors',
    'Order Desk',
    'orders@procourt.example',
    '09170000002'
WHERE NOT EXISTS (
    SELECT 1 FROM suppliers
    WHERE supplier_name = 'Pro Court Distributors'
);