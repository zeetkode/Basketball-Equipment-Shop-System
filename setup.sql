-- Reset Database Cleanly
DROP DATABASE IF EXISTS basketball_shop;
CREATE DATABASE basketball_shop;
USE basketball_shop;

-- 1. Roles Table
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Seed Roles
INSERT INTO roles (role_id, role_name) VALUES 
(1, 'Admin'),
(2, 'Customer');

-- 2. Users Table (Unified to support all API endpoints and JOIN reports)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) DEFAULT '',
    email VARCHAR(100) DEFAULT NULL,
    role_id INT DEFAULT 2,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL
);

-- Seed Seed Users
INSERT INTO users (user_id, username, password, full_name, email, role_id, role) VALUES 
(1, 'admin_user', 'password123', 'System Administrator', 'admin@basketballshop.com', 1, 'admin'),
(2, 'mjordan', 'hashedpassword23', 'Michael Jordan', 'mj@bulls.com', 2, 'customer');

-- 3. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Seed Categories
INSERT INTO categories (id, name) VALUES
(1, 'Basketballs'),
(2, 'Footwear'),
(3, 'Apparel'),
(4, 'Accessories');

-- 4. Brands Table
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Seed Brands
INSERT INTO brands (id, name) VALUES
(1, 'Nike'),
(2, 'Adidas'),
(3, 'Wilson'),
(4, 'Spalding'),
(5, 'Under Armour');

-- 5. Equipment Table
CREATE TABLE equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(60) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_safety_level INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipment_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_equipment_brand
        FOREIGN KEY (brand_id) REFERENCES brands(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Seed Sample Equipment
INSERT INTO equipment (product_name, sku, category_id, brand_id, stock_quantity) VALUES
('Evolution Game Basketball', 'BALL-WIL-001', 1, 3, 12),
('Street Outdoor Basketball', 'BALL-SPA-001', 1, 4, 18),
('Air Basketball Shoes', 'SHOE-NIK-001', 2, 1, 8);

-- 6. Inventory Table (Safety-Stock Alerts)
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_safety_level INT NOT NULL DEFAULT 5,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    order_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Seed Sample Order
INSERT INTO orders (user_id, total_amount, order_status) VALUES
(2, 149.99, 'completed');

-- 8. Suppliers Table
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(40),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Suppliers
INSERT INTO suppliers (supplier_name, contact_person, email, phone) VALUES
('Sports Central Supplies', 'Sales Team', 'sales@sportscentral.example', '09170000001'),
('Pro Court Distributors', 'Order Desk', 'orders@procourt.example', '09170000002');

-- 9. Supplier Orders Table
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

-- 10. Supplier Order Items Table
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

-- 11. Shipments Table
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