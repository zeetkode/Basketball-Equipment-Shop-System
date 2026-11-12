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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equipment_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_equipment_brand
        FOREIGN KEY (brand_id) REFERENCES brands(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT INTO equipment (equipment_id, product_name, sku, price, category_id, brand_id, stock_quantity, min_safety_level) VALUES
(1, 'Evolution Game Basketball', 'BALL-WIL-001', 74.95, 1, 3, 12, 5),
(2, 'Street Outdoor Basketball', 'BALL-SPA-001', 34.99, 1, 4, 18, 5),
(3, 'Air Basketball Shoes', 'SHOE-NIK-001', 129.99, 2, 1, 8, 5),
(4, 'Pro Reversible Jersey', 'APP-ADI-001', 29.50, 3, 2, 25, 5),
(5, 'Nike LeBron 21 Men''s Shoes', 'SHOE-NIK-002', 200.00, 2, 1, 24, 5),
(6, 'Jordan Luka 2 Basketball Shoes', 'SHOE-JOR-001', 130.00, 2, 6, 15, 5),
(7, 'Spalding TF-1000 Legacy Basketball', 'BALL-SPA-002', 74.99, 1, 4, 25, 8),
(8, 'Nike Elite Crew Basketball Socks', 'ACC-NIK-001', 14.00, 4, 1, 120, 20),
(9, 'Under Armour Curry Splash Shorts', 'APP-UA-001', 45.00, 3, 5, 30, 5),
(10, 'Wilson NBA Official Game Ball', 'BALL-WIL-002', 199.95, 1, 3, 8, 3),
(11, 'Nike Hoops Elite Pro Backpack', 'ACC-NIK-002', 85.00, 4, 1, 12, 4),
(12, 'Agility Ladder & Cones Set', 'TRN-GEN-001', 35.50, 5, 1, 20, 5),
(13, 'Spalding Breakaway Rim', 'TRN-SPA-001', 150.00, 5, 4, 6, 2);

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_safety_level INT NOT NULL DEFAULT 5,
    daily_sales_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
supplier_lead_time_days INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE stock_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    status ENUM('CRITICAL', 'RESOLVED') NOT NULL DEFAULT 'CRITICAL',
    alert_type VARCHAR(50) NOT NULL DEFAULT 'REORDER_NEEDED',
    reorder_point DECIMAL(10,2) NOT NULL,
    current_quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id)
        ON DELETE CASCADE
);

CREATE TABLE alert_audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    inventory_id INT NOT NULL,
    previous_quantity INT NOT NULL,
    changed_quantity INT NOT NULL,
    triggered_action VARCHAR(100) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id)
        REFERENCES stock_alerts(alert_id)
        ON DELETE CASCADE,
    FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id)
        ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER after_inventory_stock_update
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    DECLARE v_reorder_point DECIMAL(10,2);
    DECLARE v_alert_id INT DEFAULT NULL;

    IF NEW.stock_quantity <> OLD.stock_quantity THEN

        SET v_reorder_point =
            (NEW.daily_sales_rate * NEW.supplier_lead_time_days)
            + NEW.min_safety_level;

        IF NEW.stock_quantity < v_reorder_point THEN

            SELECT MAX(alert_id)
            INTO v_alert_id
            FROM stock_alerts
            WHERE inventory_id = NEW.inventory_id
              AND status = 'CRITICAL';

            IF v_alert_id IS NULL THEN

                INSERT INTO stock_alerts (
                    inventory_id, status, alert_type,
                    reorder_point, current_quantity
                )
                VALUES (
                    NEW.inventory_id, 'CRITICAL', 'REORDER_NEEDED',
                    v_reorder_point, NEW.stock_quantity
                );

                SET v_alert_id = LAST_INSERT_ID();

            ELSE

                UPDATE stock_alerts
                SET current_quantity = NEW.stock_quantity,
                    reorder_point = v_reorder_point
                WHERE alert_id = v_alert_id;

            END IF;

            INSERT INTO alert_audit_logs (
                alert_id, inventory_id, previous_quantity,
                changed_quantity, triggered_action
            )
            VALUES (
                v_alert_id, NEW.inventory_id, OLD.stock_quantity,
                NEW.stock_quantity, 'REORDER_NEEDED'
            );

        END IF;

    END IF;
END //

DELIMITER ;


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

-- 1. Create the Supplier Orders (Headers)
INSERT INTO supplier_orders (supplier_id, order_date, expected_date, order_status) VALUES
(1, '2026-11-01 09:00:00', '2026-11-15', 'received'),
(2, '2026-11-10 14:30:00', '2026-11-20', 'placed'),
(1, '2026-11-12 08:15:00', '2026-11-30', 'draft');

-- 2. Add the specific Equipment Items to those Orders
INSERT INTO supplier_order_items (supplier_order_id, equipment_id, quantity) VALUES
-- Order 1 (Received from Sports Central): 20 LeBron Shoes & 50 Elite Socks
(1, 5, 20),
(1, 8, 50),

-- Order 2 (Placed with Pro Court): 30 Evolution Game Basketballs
(2, 1, 30),

-- Order 3 (Draft for Sports Central): 10 Spalding Breakaway Rims
(3, 13, 10);

-- 1. Ensure the necessary Categories exist
INSERT IGNORE INTO categories (id, name) VALUES 
(1, 'Basketballs'), (2, 'Footwear'), (3, 'Apparel'), (4, 'Accessories'), (5, 'Training Gear');

-- 2. Ensure the necessary Brands exist
INSERT IGNORE INTO brands (id, name) VALUES 
(1, 'Nike'), (2, 'Adidas'), (3, 'Wilson'), (4, 'Spalding'), (5, 'Under Armour'), (6, 'Jordan');

-- 3. Insert the Equipment list for the dropdown
INSERT INTO equipment (product_name, sku, price, category_id, brand_id, stock_quantity) VALUES
('Wilson Evolution Indoor Game Basketball', 'BALL-WIL-101', 79.95, 1, 3, 50),
('Nike LeBron 21 Basketball Shoes', 'SHOE-NIK-102', 200.00, 2, 1, 20),
('Spalding TF-1000 Legacy Basketball', 'BALL-SPA-103', 74.99, 1, 4, 35),
('Jordan Luka 2 Men''s Shoes', 'SHOE-JOR-104', 130.00, 2, 6, 15),
('Under Armour Curry Splash Shorts', 'APP-UA-105', 45.00, 3, 5, 40),
('Nike Elite Crew Socks (White/Black)', 'ACC-NIK-106', 14.00, 4, 1, 100),
('Adidas Trae Unlimited Basketball Shoes', 'SHOE-ADI-107', 90.00, 2, 2, 25),
('Spalding Heavyweight Training Ball', 'TRN-SPA-108', 49.99, 5, 4, 10),
('Nike Hoops Elite Pro Backpack', 'ACC-NIK-109', 85.00, 4, 1, 12),
('Wilson NBA Official Game Ball', 'BALL-WIL-110', 199.95, 1, 3, 5);

-- ==========================================
-- 5. MEMBER 5: STOCK ALERTS & AUDIT LOGGING
-- ==========================================

-- Create stock alerts table
CREATE TABLE stock_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    status ENUM('CRITICAL', 'RESOLVED') NOT NULL DEFAULT 'CRITICAL',
    alert_type VARCHAR(50) NOT NULL DEFAULT 'REORDER_NEEDED',
    reorder_point DECIMAL(10,2) NOT NULL,
    current_quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,

    FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id)
        ON DELETE CASCADE
);

-- Create audit logs table
CREATE TABLE alert_audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    inventory_id INT NOT NULL,
    previous_quantity INT NOT NULL,
    changed_quantity INT NOT NULL,
    triggered_action VARCHAR(100) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (alert_id)
        REFERENCES stock_alerts(alert_id)
        ON DELETE CASCADE,

    FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id)
        ON DELETE CASCADE
);

-- Automatically create alerts when stock is below reorder point
DELIMITER //

CREATE TRIGGER after_inventory_stock_update
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    DECLARE v_reorder_point DECIMAL(10,2);
    DECLARE v_alert_id INT DEFAULT NULL;

    IF NEW.stock_quantity <> OLD.stock_quantity THEN

        SET v_reorder_point =
            (NEW.daily_sales_rate * NEW.supplier_lead_time_days)
            + NEW.min_safety_level;

        IF NEW.stock_quantity < v_reorder_point THEN

            SELECT MAX(alert_id)
            INTO v_alert_id
            FROM stock_alerts
            WHERE inventory_id = NEW.inventory_id
              AND status = 'CRITICAL';

            IF v_alert_id IS NULL THEN

                INSERT INTO stock_alerts (
                    inventory_id, status, alert_type,
                    reorder_point, current_quantity
                )
                VALUES (
                    NEW.inventory_id, 'CRITICAL', 'REORDER_NEEDED',
                    v_reorder_point, NEW.stock_quantity
                );

                SET v_alert_id = LAST_INSERT_ID();

            ELSE

                UPDATE stock_alerts
                SET current_quantity = NEW.stock_quantity,
                    reorder_point = v_reorder_point
                WHERE alert_id = v_alert_id;

            END IF;

            INSERT INTO alert_audit_logs (
                alert_id, inventory_id,
                previous_quantity, changed_quantity,
                triggered_action
            )
            VALUES (
                v_alert_id, NEW.inventory_id,
                OLD.stock_quantity, NEW.stock_quantity,
                'REORDER_NEEDED'
            );

        END IF;
    END IF;
END //

DELIMITER ;
