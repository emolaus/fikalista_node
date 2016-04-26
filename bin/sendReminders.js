var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.run("PRAGMA foreign_keys=ON;");

var currentWeekNumber = require('current-week-number');
var logger = require('../private_modules/mylogger');
var dbactions = require('../private_modules/dbactions');
var validator = require('validator');

// Get current year, current week
var today = new Date();
var year = today.getFullYear();
var week = currentWeekNumber(today);

// TODO Step forward each group if not previously done

dbactions.getGroups(db, function success(list) {
  console.log(list);
  for (var i = 0; i < list.length; i++) {
    var statement = db.prepare('SELECT groupurl, name, email, MIN(user_order) FROM users WHERE groupurl=?', list[i].groupurl);
    statement.get(function (err, user) {
      console.log(user);
      sendReminder(user, function (result) {
        if (result) console.log('Email sent, update database');
        else console.log('No email sent');
      });
    });
    // get MIN(user_)
      // If NOT (groupurl, current_year, current_week, userid) in reminders
        // If user has valid email
          // Send reminder
          // Update reminders   
  }
}, function error() {
  log('failed fetching groups', 'sendReminders');  
  console.log('send reminders failed fetching groups.');
});

/**
 * Pass true if email sent, false otherwise 
 **/
function sendReminder(user, callback) {
  if (!user.email) callback(false);
  else if (!validator.isEmail(user.email)) callback(false);
  else {
    
    
    callback(true);
  }
}


