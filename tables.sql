-- Drop existing tables
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS cart;

-- users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  UNIQUE(username),
  UNIQUE(email)
);

-- products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  image TEXT
);

-- orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- order_items table
CREATE TABLE IF NOT EXISTS order_items (
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  PRIMARY KEY(order_id, product_id)
);

-- feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- cart table
CREATE TABLE "cart" (
	"user-id"	INTEGER NOT NULL,
	"product-id"	INTEGER NOT NULL,
	"quantity"	INTEGER NOT NULL,
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Insert sample users
INSERT INTO users (username, password, email) VALUES
('user1', 'password1', 'user1@example.com'),
('user2', 'password2', 'user2@example.com'),
('user3', 'password3', 'user3@example.com');

-- Insert sample products
INSERT INTO products (name, description, price, category, image) VALUES
('T-shirt', 'A cool T-shirt', 19.99, 'clothing', 'tshirt.png'),
('Jeans', 'Comfortable jeans', 49.99, 'clothing', 'jeans.png'),
('Microwave', 'A powerful microwave', 99.99, 'kitchen', 'microwave.png'),
('Laptop', 'A high-performance laptop', 999.99, 'electronics', 'laptop.png'),
('Coffee Maker', 'Brew the perfect coffee', 29.99, 'kitchen', 'coffeemaker.png'),
('Headphones', 'Noise-cancelling headphones', 199.99, 'electronics', 'headphones.png');

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, date) VALUES
(1, 119.98, '2024-06-01'),
(2, 49.99, '2024-06-02'),
(3, 999.99, '2024-06-03');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 3, 1),
(2, 2, 1),
(3, 4, 1);

-- Insert sample feedback
INSERT INTO feedback (product_id, user_id, rating, comment) VALUES
(1, 1, 5, 'Great T-shirt!'),
(2, 2, 4, 'Comfortable jeans'),
(3, 3, 3, 'Microwave is okay'),
(4, 1, 5, 'Best laptop ever'),
(5, 2, 4, 'Coffee Maker works well'),
(6, 3, 5, 'Love these headphones');
