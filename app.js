'use strict';
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Path to the SQLite session store file
const sessionStorePath = path.join(__dirname, 'sessions.sqlite');

// Delete the session store file on server restart
if (fs.existsSync(sessionStorePath)) {
  fs.unlinkSync(sessionStorePath);
}

// Configure multer to store the uploaded file with a .png extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Specify the directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.png'); // Rename the file with a .png extension
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to handle file uploads
const upload = multer({ storage: storage });

// Session management
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite'
  }),
  secret: 'your secret key',
  resave: false,
  saveUninitialized: false
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login.html');
  }
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Add Product
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    let { name, description, price, category } = req.body;
    let image = req.file ? req.file.filename : null;
    let query = `INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)`;
    let values = [name, description, price, category, image];
    let db = await getDBConnection();
    let newEntry = await db.run(query, values);
    await db.close();
    res.json({ 'success': true, 'id': newEntry.lastID });
  } catch (err) {
    console.log(err);
    res.type('text').status(500).send('Error adding product');
  }
});

// Get All Products
app.get('/products', async (req, res) => {
  try {
    let db = await getDBConnection();
    let allProducts = await db.all('SELECT * FROM products');
    await db.close();
    res.json(allProducts);
  } catch (err) {
    res.type('text').status(500).send('Error retrieving products');
  }
});

// Get Product by ID
app.get('/products/:id', async (req, res) => {
  try {
    let query = 'SELECT * FROM products WHERE id = ?';
    let db = await getDBConnection();
    let product = await db.get(query, req.params.id);
    await db.close();
    if (!product) {
      return res.type('text').status(400).send('Invalid request: id does not exist');
    }
    res.json(product);
  } catch (err) {
    res.type('text').status(500).send('Error retrieving product');
  }
});

// Get Product of a category
app.get('/products/category/:category', async (req, res) => {
  try {
    let query = 'SELECT * FROM products WHERE category = ?';
    let db = await getDBConnection();
    let products = await db.all(query, req.params.category);
    await db.close();
    res.json(products);
  } catch (err) {
    console.error('Error retrieving products of this category:', err); // Enhanced logging
    res.type('text').status(500).send('Error retrieving products of this category');
  }
});

// Search Products
app.get('/search/:searchTerm', async (req, res) => {
  try {
    let searchTerm = req.params.searchTerm;
    let query = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?';
    let values = ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'];
    let db = await getDBConnection();
    let searchResult = await db.all(query, values);
    await db.close();
    res.json(searchResult);
  } catch (err) {
    res.type('text').status(500).send('Error searching products');
  }
});

// User Login
app.post('/login', multer().none(), async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    console.log(`Login attempt with username: ${username} and password: ${password}`);

    if (!username || !password) {
      return res.type('text').status(400).send('Missing required parameters: username and password');
    }

    let query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    let db = await getDBConnection();
    let user = await db.get(query, [username, password]);
    console.log(`Queried user: ${JSON.stringify(user)}`);
    await db.close();

    if (!user) {
      return res.type('text').status(400).send('Invalid username or password');
    }

    req.session.userId = user.id;
    res.json({ id: user.id });
  } catch (err) {
    console.error(`Error logging in: ${err}`);
    res.type('text').status(500).send('Error logging in');
  }
});

// User Registration
app.post('/register', multer().none(), async (req, res) => {
  try {
    let { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.type('text').status(400).send('Missing required parameters: username, password, or email');
    }
    let query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    let db = await getDBConnection();
    let newUser = await db.run(query, [username, password, email]);
    await db.close();
    req.session.userId = newUser.lastID;
    res.json({ id: newUser.lastID });
  } catch (err) {
    res.type('text').status(500).send('Error registering user');
  }
});

// Add Feedback
app.post('/feedback', multer().none(), async (req, res) => {
  try {
    let { productId, userId, rating, comment } = req.body;
    if (!productId || !userId || !rating) {
      return res.type('text').status(400).send('Missing required parameters: product id, user id, or rating');
    }
    let query = 'INSERT INTO feedback (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
    let values = [productId, userId, rating, comment];
    let db = await getDBConnection();
    let newFeedback = await db.run(query, values);
    res.json({ 'lastId': newFeedback.lastID });
  } catch (err) {
    res.type('text').status(500).send('Error adding feedback');
  }
});

// Get Feedback for Product
app.get('/feedback/:productId', async (req, res) => {
  try {
    let query = 'SELECT * FROM feedback WHERE product_id = ?';
    let db = await getDBConnection();
    let feedbacks = await db.all(query, [req.params.productId]);
    await db.close();
    res.json(feedbacks);
  } catch (err) {
    res.type('text').status(500).send('Error retrieving feedback');
  }
});

// Place Order
app.post('/orders', multer().none(), isAuthenticated, async (req, res) => {
  try {
    let { userId, totalAmount, items } = req.body;
    if (!userId || !totalAmount || !items) {
      return res.type('text').status(400).send('Missing required parameters: userId, totalAmount, or items');
    }
    let date = new Date().toISOString().split('T')[0];
    items = JSON.parse(items);

    let db = await getDBConnection();

    // Insert the order into the orders table
    let query = 'INSERT INTO orders (user_id, total_amount, date) VALUES (?, ?, ?)';
    let orderResult = await db.run(query, [userId, totalAmount, date]);
    let orderId = orderResult.lastID;

    // Prepare the order items data
    let orderItems = items.map(item => ({
      ...item,
      orderId
    }));
    let placeholders = orderItems.map(() => '(?, ?, ?)').join(', ');
    let values = orderItems.flatMap(item => [item.orderId, item.productId, item.quantity]);
    query = 'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)';

    for (let i = 0; i < items.length; i++) {
      await db.run(query, [values[i * 3], values[i * 3 + 1], values[i * 3 + 2]]);
    }
    await db.close();
    res.json({ 'orderId': orderId });
  } catch (err) {
    res.type('text').status(500).send('Error occurred while placing order');
  }
});

// Get Orders for User
app.get('/orders/:userId', isAuthenticated, async (req, res) => {
  try {
    let query = 'SELECT * FROM orders WHERE user_id = ?';
    let db = await getDBConnection();
    let orders = await db.all(query, [req.params.userId]);
    await db.close();
    res.json(orders);
  } catch (err) {
    res.type('text').status(500).send('Error retrieving orders');
  }
});

// Add to cart
app.post('/addToCart', multer().none(), isAuthenticated, async (req, res) => {
  try {
    let { productId, userId, rating, comment } = req.body;
    if (!productId || !userId || !rating) {
      return res.type('text').status(400).send('Missing required parameters: product id, user id, or rating');
    }
    let query = 'INSERT INTO feedback (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
    let values = [productId, userId, rating, comment];
    let db = await getDBConnection();
    let newFeedback = await db.run(query, values);
    res.json({ 'lastId': newFeedback.lastID });
  } catch (err) {
    res.type('text').status(500).send('Error adding feedback');
  }
});

// Get user details for profile
app.get('/users/:id', isAuthenticated, async (req, res) => {
  try {
    let query = 'SELECT * FROM users WHERE id = ?';
    let db = await getDBConnection();
    let user = await db.get(query, [req.params.id]);
    await db.close();
    if (!user) {
      return res.type('text').status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    res.type('text').status(500).send('Error retrieving user details');
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.type('text').status(500).send('Error logging out');
    }
    res.clearCookie('connect.sid');
    res.sendStatus(200);
  });
});

// Establishes a database connection to the database and returns the database object.
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'main.db',
    driver: sqlite3.Database
  });
  return db;
}

// Serve main.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Serve profile.html with authentication check
app.get('/profile.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
