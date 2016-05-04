var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.serialize(function () {
  db.run("PRAGMA foreign_keys=ON;");
  
  db.run("DELETE FROM skipweeks");
  db.run("DELETE FROM reminders");
  db.run("DELETE FROM users");
  db.run("DELETE FROM groups");
  
  db.run("INSERT INTO groups (name, groupurl) VALUES ('94713', '94713')");
  
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Ruben', 200, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Linn', 300, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Pontius', 400, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Thore', 500, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Pär', 600, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Nicholas', 700, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Malin', 800, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Tomas', 900, 'contact@mattiasolausson.se')");
  db.run("INSERT INTO users (groupurl, name, user_order, email) VALUES ('94713', 'Ingemar', 1000, 'contact@mattiasolausson.se')");
  
  db.run("INSERT INTO updatescriptlastrun ('94713', year, week) VALUES (2016, 18)");

});