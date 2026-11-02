CREATE DATABASE IF NOT EXISTS basketball_shop;
USE basketball_shop;

CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- Seed Data
INSERT INTO Roles (role_name) VALUES ('Admin'), ('Customer');
INSERT INTO Users (username, password, role_id) VALUES ('admin_user', 'password123', 1);