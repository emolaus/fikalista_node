var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');

db.run("CREATE TABLE groups (" + 
        "groupid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," + 
        "name TEXT NOT NULL," +
        "url_name TEXT NOT NULL UNIQUE," +
        "pincode TEXT DEFAULT '0000'," + 
        "creation_time INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL" +
        ")");
db.run("CREATE TABLE users (" + 
        "userid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "groupid INTEGER NOT NULL," + 
        "name TEXT NOT NULL," +
        "user_order INTEGER DEFAULT 0," + // "order" protected keyword...
        "fika_count INTEGER DEFAULT 0," +
        "email TEXT," + 
        "last_successful_email_timestamp INTEGER," +
        "creation_timestamp INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL" +
        ")");
        
db.run("CREATE TABLE skipweeks (" + 
        "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "groupid INTEGER NOT NULL," +
        "week_number INTEGER NOT NULL," +
        "year INTEGER NOT NULL" +
        ")");
/* TODO Tables
Users			
userid	name	group	order
Skipweeks			
groupid	year	week	
*/