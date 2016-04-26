var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');

db.run("CREATE TABLE groups (" + 
        //"groupid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," + 
        "groupurl TEXT NOT NULL PRIMARY KEY UNIQUE," +
        "name TEXT NOT NULL," +
        "pincode TEXT DEFAULT '0000'," + 
        "creation_time INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL" +
        ")");
db.run("CREATE TABLE users (" + 
        "userid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "groupurl TEXT NOT NULL," + 
        "name TEXT NOT NULL," +
        "user_order INTEGER DEFAULT 0," + // "order" protected keyword...
        "fika_count INTEGER DEFAULT 0," +
        "email TEXT," + 
        "last_successful_email_timestamp INTEGER DEFAULT 0," +
        "last_fika_timestamp INTEGER DEFAULT 0," + 
        "creation_timestamp INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL," +
        "FOREIGN KEY (groupurl) REFERENCES groups(groupurl)" +
        ")");
        
db.run("CREATE TABLE skipweeks (" + 
        "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "groupurl TEXT NOT NULL," +
        "week INTEGER NOT NULL," +
        "year INTEGER NOT NULL," +
        "FOREIGN KEY (groupurl) REFERENCES groups(groupurl)" +
        ")");
db.run("CREATE TABLE reminders (" +
        "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
        "groupurl TEXT NOT NULL," + 
        "userid INTEGER NOT NULL," + 
        "year INTEGER NOT NULL," +
        "week INTEGER NOT NULL," +
        "timestamp INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL," +
        "FOREIGN KEY (groupurl) REFERENCES groups(groupurl)," +
        "FOREIGN KEY (userid) REFERENCES users(userid)" +
        ")"); 
db.close();