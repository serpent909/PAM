const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

function resetDatabase(db) {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS appointments", (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Dropped appointments table");
      }
    });

    const schema = fs.readFileSync('Database/schema.sql').toString();
    db.exec(schema, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Tables created.');
      }
    });
  });
}

function initializeDatabase() {
  const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Connected to the database.');
      resetDatabase(db);
      db.close();
    }
  });
}

initializeDatabase();