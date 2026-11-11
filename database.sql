CREATE DATABASE IF NOT EXISTS smartshop_db;
USE smartshop_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Coupons Table (Discounts)
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_percentage INT NOT NULL
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. Sample Initial Data (භාණ්ඩ සහ Admin user)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@smartshop.com', 'admin123', 'admin'),
('Kasun Perera', 'kasun@gmail.com', '123456', 'customer');

INSERT INTO products (name, category, price, stock, image_url) VALUES 
('Wireless Bluetooth Earbuds', 'Electronics', 4500.00, 15, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'),
('Smart Fitness Watch', 'Electronics', 7200.00, 8, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
('Cotton Casual T-Shirt', 'Fashion', 2200.00, 20, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'),
('Stainless Steel Water Bottle', 'Lifestyle', 1800.00, 5, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500');

INSERT INTO coupons (code, discount_percentage) VALUES ('NEW10', 10), ('SALE20', 20);