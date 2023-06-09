const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to the database.');
        const schema = fs.readFileSync('./Database/schema.sql').toString();
        db.exec(schema, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Tables created.');
            resolve(db);
          }
        });
      }
    });
  });
}

// Wrapper function for db.get() that returns a Promise
function getPromise(query, params, db) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = { initializeDatabase, getPromise };