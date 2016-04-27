var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.serialize(function () {
  db.run("PRAGMA foreign_keys=ON;");
  
  db.run("DELETE FROM skipweeks");
  db.run("DELETE FROM reminders");
  db.run("DELETE FROM users");
  db.run("DELETE FROM groups");
  
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group to mail', 'group1')");
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group with exception', 'group2')");
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group already reminded', 'group3')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group1', 'Adam', 100, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group1', 'Bertil', 200, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group2', 'Calle', 100, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group2', 'David', 200, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email, userid) VALUES ('group3', 'Erik', 10, 'contact@mattiasolausson.se', 10)");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('group3', 'Fredrik', 200, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('group2', 17, 2016)");
  
  db.run("INSERT INTO reminders (groupurl, userid, year, week) VALUES ('group3', 10, 2016, 17)");
});