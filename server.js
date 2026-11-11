const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const db = mysql.createConnection({
 host: '127.0.0.1',
  user: 'root',      // ඔබේ MySQL username එක
  password: '',      // ඔබේ MySQL password එක (XAMPP නම් empty තබන්න)
  database: 'smartshop_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database!');
  }
});

// 1. Auth: Simple Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ user: results[0] });
  });
});

// 2. Products: Get all products (with search & filter)
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 3. Products: Add Product (Admin)
app.post('/api/products', (req, res) => {
  const { name, category, price, stock, image_url } = req.body;
  const sql = 'INSERT INTO products (name, category, price, stock, image_url) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, category, price, stock, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product added successfully', id: result.insertId });
  });
});

// 4. Products: Delete Product (Admin)
app.delete('/api/products/:id', (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted' });
  });
});

// 5. Coupons: Validate coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code } = req.body;
  db.query('SELECT * FROM coupons WHERE code = ?', [code], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Invalid coupon code' });
    res.json(results[0]);
  });
});

// 6. Orders: Checkout & Auto-deduct stock
app.post('/api/orders', (req, res) => {
  const { user_name, address, phone, total_amount, cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // 1. Create order
  const orderSql = 'INSERT INTO orders (user_name, address, phone, total_amount) VALUES (?, ?, ?, ?)';
  db.query(orderSql, [user_name, address, phone, total_amount], (err, orderResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const orderId = orderResult.insertId;

    // 2. Insert items and update stock
    cartItems.forEach(item => {
      db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', 
        [orderId, item.id, item.qty, item.price]);

      // Deduct stock
      db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id]);
    });

    res.json({ message: 'Order placed successfully!', orderId });
  });
});

// 7. Orders: Get all orders (Admin / Tracking)
app.get('/api/orders', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 8. Orders: Update status (Admin)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order status updated' });
  });
});

// 9. Admin Analytics
app.get('/api/admin/analytics', (req, res) => {
  const queries = {
    totalSales: 'SELECT SUM(total_amount) AS totalSales FROM orders',
    totalOrders: 'SELECT COUNT(*) AS totalOrders FROM orders',
    lowStock: 'SELECT COUNT(*) AS lowStockCount FROM products WHERE stock <= 5'
  };

  db.query(`${queries.totalSales}; ${queries.totalOrders}; ${queries.lowStock}`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      totalSales: results[0][0].totalSales || 0,
      totalOrders: results[1][0].totalOrders || 0,
      lowStockCount: results[2][0].lowStockCount || 0
    });
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});