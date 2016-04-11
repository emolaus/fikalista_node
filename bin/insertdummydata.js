var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');

db.run("INSERT INTO groups (name, url_name) VALUES ('11223', '11223')");
db.run("INSERT INTO groups (name, url_name) VALUES ('34567', 'mygroup')");

db.run("INSERT INTO users (groupid, name) VALUES (1, 'Ada')");
db.run("INSERT INTO users (groupid, name) VALUES (1, 'Beda')");
db.run("INSERT INTO users (groupid, name) VALUES (1, 'Calle')");

db.run("INSERT INTO users (groupid, name) VALUES (2, 'Dennis')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Fredrik')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Gunnel')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Henrik')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Inga')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Josef')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Kalle')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Lena')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Mia')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Nora')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Ola')");
db.run("INSERT INTO users (groupid, name) VALUES (2, 'Pia')");