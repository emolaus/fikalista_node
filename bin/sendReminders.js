var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.run("PRAGMA foreign_keys=ON;");

var currentWeekNumber = require('current-week-number');
var logger = require('../private_modules/mylogger');
var dbactions = require('../private_modules/dbactions');
var validator = require('validator');
var mailer = require('../private_modules/mail');
// Get current year, current week
var today = new Date();
var year = today.getFullYear();
var week = currentWeekNumber(today);

// TODO Step forward each group if not previously done

mailer.authenticate(function () {
  if (mailer.auth) {
    console.log('Authentication succeeded');
    sendEmails();
  }
  else console.log('Authentication failed.');
  
});

function sendEmails() {
  dbactions.getGroups(db, function success(list) {
    for (var i = 0; i < list.length; i++) {
      var statement = db.prepare('SELECT groupurl, name, email, MIN(user_order) FROM users WHERE groupurl=?', list[i].groupurl);
      statement.get(function (err, user) {
        sendReminder(user, function (result) {
          if (result) log('Email sent to ' + user.name + ' (' + user.email + ')', 'sendReminders.sendEmail');
          else log('No email sent to ' + user.name, 'sendReminders.sendEmail');
        });
      });  
    }
  }, function error() {
    log('failed fetching groups', 'sendReminders');  
    console.log('send reminders failed fetching groups.');
  });
};
/**
 * Pass true if email sent, false otherwise 
 **/
function sendReminder(user, callback) {
  if (!user.email) callback(false);
  else if (!validator.isEmail(user.email)) callback(false);
  else {
    mailer.sendMessage(user.email, 'duharfikat@gmail.com', 'Jobbfikat', 'Hej ' + user.name + '!\n Du har fikat denna vecka!',
    function success() {
      callback(true);
    }, function error() {
      callback(false);
    });
  }
}


