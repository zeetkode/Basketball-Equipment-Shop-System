CREATE DATABASE IF NOT EXISTS basketball_shop;
USE basketball_shop;

-- 1. Roles Table (Team Leader)
CREATE TABLE IF NOT EXISTS Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

-- 2. Users Table (Leader base + Feature columns combined)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) DEFAULT 'Customer User',
    email VARCHAR(100) UNIQUE,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE SET NULL
);

-- 3. Inventory Table (Your Feature)
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_safety_level INT NOT NULL DEFAULT 5,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Orders Table (Your Feature)
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    order_status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 5. Seed Roles
INSERT IGNORE INTO Roles (role_id, role_name) VALUES 
(1, 'Admin'), 
(2, 'Customer');

-- 6. Seed Users
INSERT INTO Users (user_id, username, password, full_name, email, role, role_id)
VALUES 
(1, 'admin_user', 'password123', 'System Admin', 'admin@basketballshop.com', 'admin', 1),
(2, 'mjordan', 'hashedpassword23', 'Michael Jordan', 'mj@bulls.com', 'customer', 2)
ON DUPLICATE KEY UPDATE 
    full_name = VALUES(full_name),
    email = VALUES(email),
    role = VALUES(role),
    role_id = VALUES(role_id);

-- 7. Seed Sample Inventory Items
INSERT IGNORE INTO inventory (inventory_id, product_name, sku, stock_quantity, min_safety_level)
VALUES 
(1, 'Spalding Official Game Ball', 'BALL-SPALD-01', 25, 5),
(2, 'Nike Elite Pro Basketball Backpack', 'BAG-NIKE-02', 12, 3),
(3, 'Wilson Evolution Indoor Basketball', 'BALL-WILS-03', 18, 5);

-- 8. Seed Sample Order
INSERT IGNORE INTO orders (order_id, user_id, total_amount, order_status)
VALUES 
(1, 2, 89.99, 'completed');