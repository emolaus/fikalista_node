var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.serialize(function () {
  db.run("PRAGMA foreign_keys=ON;");
  
  db.run("DELETE FROM users");
  db.run("DELETE FROM skipweeks");
  db.run("DELETE FROM groups");
  
  db.run("INSERT INTO groups (name, groupurl) VALUES ('A group to mail', 'mailgroup')");
  db.run("INSERT INTO groups (name, groupurl) VALUES ('11223', '11223')");
  db.run("INSERT INTO groups (name, groupurl) VALUES ('My test group', 'mygroup')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('mailgroup', 'Adam', 100, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('mailgroup', 'Bertil', 200, 'mattiasolausson@volvocars.com')");
  
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('11223', 'Ada', 100)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('11223', 'Beda', 200)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('11223', 'Calle', 300)");
  
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Fredrik', 200)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Dennis', 100)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Gunnel', 300)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Henrik', 400)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Inga', 500)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Josef', 600)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Kalle', 700)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Lena', 800)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Mia', 900)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Nora', 1000)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Ola', 1100)");
  db.run("INSERT INTO users (groupurl, name, user_order) VALUES ('mygroup', 'Pia', 1200)");
  
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 52, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 23, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 20, 2015)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('11223', 20, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 20, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 10, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 50, 2016)");
  db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 22, 2016)");
});