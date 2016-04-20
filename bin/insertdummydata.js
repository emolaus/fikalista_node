var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');

db.run("INSERT INTO groups (name, groupurl) VALUES ('11223', '11223')");
db.run("INSERT INTO groups (name, groupurl) VALUES ('My test group', 'mygroup')");

db.run("INSERT INTO users (groupurl, name) VALUES ('11223', 'Ada')");
db.run("INSERT INTO users (groupurl, name) VALUES ('11223', 'Beda')");
db.run("INSERT INTO users (groupurl, name) VALUES ('11223', 'Calle')");

db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Dennis')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Fredrik')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Gunnel')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Henrik')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Inga')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Josef')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Kalle')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Lena')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Mia')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Nora')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Ola')");
db.run("INSERT INTO users (groupurl, name) VALUES ('mygroup', 'Pia')");

db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 20, 2015)");
db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 10, 2016)");
db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 20, 2016)");
db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 22, 2016)");
db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 23, 2016)");
db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 50, 2016)");
db.run("INSERT INTO skipweeks (groupurl, week, year) VALUES ('mygroup', 2, 2017)");
