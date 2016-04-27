var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.serialize(function () {
  db.run("PRAGMA foreign_keys=ON;");
  
  db.run("DELETE FROM updatescriptlastrun");
  db.run("DELETE FROM skipweeks");
  db.run("DELETE FROM reminders");
  db.run("DELETE FROM users");
  db.run("DELETE FROM groups");
  
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group to mail', 'group1')");
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group with exception', 'group2')");
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group with several exceptions', 'group3')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group1', 'Adam', 100, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group1', 'Bertil', 200, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group1', 'Calle', 300, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group2', 'Alva', 100, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group2', 'Bea', 200, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group2', 'Cilla', 300, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group3', 'Arvid', 100, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group3', 'Beda', 200, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group3', 'Carl', 300, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('group2', 16, 2016)");
  
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('group3', 16, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('group3', 17, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('group3', 18, 2016)");
});