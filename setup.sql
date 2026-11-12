-- Reset Database Cleanly
DROP DATABASE IF EXISTS basketball_shop;
CREATE DATABASE basketball_shop;
USE basketball_shop;

-- ========================================================
-- 1. AUTHENTICATION & USERS (Leader Base)
-- ========================================================
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Admin'),
(2, 'Customer');

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) DEFAULT '',
    email VARCHAR(100) DEFAULT NULL UNIQUE,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    role_id INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL
);

INSERT INTO users (user_id, username, password, full_name, email, role_id, role) VALUES 
(1, 'admin_user', 'password123', 'System Administrator', 'admin@basketballshop.com', 1, 'admin'),
(2, 'mjordan', 'hashedpassword23', 'Michael Jordan', 'mj@bulls.com', 2, 'customer');

-- ========================================================
-- 2. CATALOG & INVENTORY (Team Prerequisites)
-- ========================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO categories (id, name) VALUES
(1, 'Basketballs'),
(2, 'Footwear'),
(3, 'Apparel'),
(4, 'Accessories'),
(5, 'Training Gear');

CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO brands (id, name) VALUES
(1, 'Nike'),
(2, 'Adidas'),
(3, 'Wilson'),
(4, 'Spalding'),
(5, 'Under Armour'),
(6, 'Jordan');

CREATE TABLE equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(60) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_safety_level INT NOT NULL DEFAULT 5,
    daily_sales_rate DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    supplier_lead_time_days INT NOT NULL DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipment_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_equipment_brand
        FOREIGN KEY (brand_id) REFERENCES brands(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Unified, Deduplicated Equipment List
INSERT INTO equipment (equipment_id, product_name, sku, price, category_id, brand_id, stock_quantity, min_safety_level, daily_sales_rate, supplier_lead_time_days) VALUES
(1, 'Evolution Game Basketball', 'BALL-WIL-001', 74.95, 1, 3, 12, 5, 2.0, 5),
(2, 'Street Outdoor Basketball', 'BALL-SPA-001', 34.99, 1, 4, 18, 5, 1.5, 7),
(3, 'Air Basketball Shoes', 'SHOE-NIK-001', 129.99, 2, 1, 8, 5, 1.0, 10),
(4, 'Pro Reversible Jersey', 'APP-ADI-001', 29.50, 3, 2, 25, 5, 3.0, 7),
(5, 'Nike LeBron 21 Men''s Shoes', 'SHOE-NIK-002', 200.00, 2, 1, 24, 5, 2.5, 14),
(6, 'Jordan Luka 2 Basketball Shoes', 'SHOE-JOR-001', 130.00, 2, 6, 15, 5, 2.0, 10),
(7, 'Spalding TF-1000 Legacy Basketball', 'BALL-SPA-002', 74.99, 1, 4, 25, 8, 3.0, 7),
(8, 'Nike Elite Crew Basketball Socks', 'ACC-NIK-001', 14.00, 4, 1, 120, 20, 10.0, 5),
(9, 'Under Armour Curry Splash Shorts', 'APP-UA-001', 45.00, 3, 5, 30, 5, 4.0, 7),
(10, 'Wilson NBA Official Game Ball', 'BALL-WIL-002', 199.95, 1, 3, 8, 3, 0.5, 14),
(11, 'Nike Hoops Elite Pro Backpack', 'ACC-NIK-002', 85.00, 4, 1, 12, 4, 1.0, 10),
(12, 'Agility Ladder & Cones Set', 'TRN-GEN-001', 35.50, 5, 1, 20, 5, 1.5, 7),
(13, 'Spalding Breakaway Rim', 'TRN-SPA-001', 150.00, 5, 4, 6, 2, 0.2, 21),
(14, 'Adidas Trae Unlimited Basketball Shoes', 'SHOE-ADI-107', 90.00, 2, 2, 25, 5, 2.0, 10),
(15, 'Spalding Heavyweight Training Ball', 'TRN-SPA-108', 49.99, 5, 4, 10, 3, 0.5, 7);

-- ========================================================
-- 3. TRANSACTIONS MODULE (Member 3 Scope)
-- ========================================================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    order_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    equipment_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id) ON DELETE RESTRICT
);

INSERT INTO orders (order_id, user_id, total_amount, order_status) VALUES
(1, 2, 109.94, 'completed');

INSERT INTO order_items (order_item_id, order_id, equipment_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 74.95),
(2, 1, 2, 1, 34.99);

-- ========================================================
-- 4. SUPPLIER MANAGEMENT & SHIPMENTS (Leader Modules)
-- ========================================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO suppliers (supplier_name, contact_person, email, phone) VALUES
('Sports Central Supplies', 'Sales Team', 'sales@sportscentral.example', '09170000001'),
('Pro Court Distributors', 'Order Desk', 'orders@procourt.example', '09170000002');

CREATE TABLE supplier_orders (
    supplier_order_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_date DATE,
    order_status ENUM('draft', 'placed', 'partially_received', 'received', 'cancelled') NOT NULL DEFAULT 'draft',
    CONSTRAINT fk_supplier_orders_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE supplier_order_items (
    supplier_order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_order_id INT NOT NULL,
    equipment_id INT NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT chk_supplier_item_quantity CHECK (quantity > 0),
    CONSTRAINT fk_supplier_items_order
        FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(supplier_order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_supplier_items_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_order_id INT NOT NULL,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    shipment_status ENUM('pending', 'shipped', 'in_transit', 'delayed', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    shipped_date DATE,
    expected_delivery DATE,
    delivered_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipments_supplier_order
        FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(supplier_order_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Supplier Order Seed Data
INSERT INTO supplier_orders (supplier_id, order_date, expected_date, order_status) VALUES
(1, '2026-11-01 09:00:00', '2026-11-15', 'received'),
(2, '2026-11-10 14:30:00', '2026-11-20', 'placed'),
(1, '2026-11-12 08:15:00', '2026-11-30', 'draft');

INSERT INTO supplier_order_items (supplier_order_id, equipment_id, quantity) VALUES
(1, 5, 20),
(1, 8, 50),
(2, 1, 30),
(3, 13, 10);
