const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('main.db');

const sql = fs.readFileSync('tables.sql').toString();

db.exec(sql, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database initialized successfully.');
  }
  db.close();
});
