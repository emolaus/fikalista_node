var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
db.run("PRAGMA foreign_keys=ON;");

var currentWeekNumber = require('current-week-number');
var log = require('../private_modules/mylogger').log;
var dbactions = require('../private_modules/dbactions');
var validator = require('validator');
var mailer = require('../private_modules/mail');
var step = require('../private_modules/stepforward');
var config = require('../config/config');

// Get current year, current week
var today = new Date();
var year = config.TESTMODE ? config.TESTYEAR : today.getFullYear();
var week = config.TESTMODE ? config.TESTWEEK : currentWeekNumber(today);

log('updateAndSend called', 'updateAndSendReminders.js');

// TODO Step forward each group if not previously done
step.forwardEntireDB(db, year, week, sendReminders);

function sendReminders() {
  if (config.TESTMODE) {
    sendEmails();
    return;
  }
  mailer.authenticate(function () {
    if (mailer.auth) {
      console.log('Authentication succeeded');
      sendEmails();
    }
    else console.log('Authentication failed.');
    
  });
}
  
function sendEmails() {
  dbactions.getGroups(db, function success(list) {
    for (var i = 0; i < list.length; i++) {
      var statement = db.prepare('SELECT groupurl, name, email, userid, MIN(user_order) FROM users WHERE groupurl=?', list[i].groupurl);
      statement.get(function (err, user) {
        if (err) {
          log('Error fetching current fika responsible for group ' + list[i].groupurl, 'sendReminders.sendEmails');
          return;
        }
        var statementCheckReminderSend = db.prepare('SELECT * FROM reminders WHERE groupurl=? AND userid=? AND year=? AND week=?', user.groupurl, user.userid, year, week);
        statementCheckReminderSend.get(function (err, reminderHasBeenSent) {
          if (err) log('Failed checking if reminder has been sent', 'sendReminders.sendEmails');
          if (!reminderHasBeenSent) {
            // Check if reminder SHOULD be sent this week (does the group have an exception this week?)
            var statementCheckIfReminderShouldBeSent = db.prepare('SELECT * FROM skipweeks WHERE groupurl=? AND year=? AND week=?',user.groupurl, year, week);
            statementCheckIfReminderShouldBeSent.get(function (err, skipThisWeek) {
              if (err) {
                log('Failed checking if week should be skipped', 'sendReminders.sendEmails');
              }
              if (!skipThisWeek) {
                sendReminder(user, function (result) {
                  if (result) {
                    log('Email sent to ' + user.name + ' (' + user.email + ')', 'sendReminders.sendEmail');
                    updateDatabaseWithMailInfo(user);
                  }
                  else log('No email sent to ' + user.name, 'sendReminders.sendEmail');
                });         
              }
            });
          }
        });
      });  
    }
  }, function error() {
    log('failed fetching groups', 'sendReminders');  
  });
};

/**
 * Pass true if email sent, false otherwise 
 **/
function sendReminder(user, callback) {
  if (!user.email) callback(false);
  else if (!validator.isEmail(user.email)) callback(false);
  else if (!config.SEND_EMAIL) {
    console.log('Mail would have been sent to ' + JSON.stringify(user));
    callback(true);
  } else {
    mailer.sendMessage(user.email, 'duharfikat@gmail.com', 'Jobbfikat', 'Hej ' + user.name + '!\n Du har fikat denna vecka!',
    function success() {
      callback(true);
    }, function error() {
      callback(false);
    });
  }
}

function updateDatabaseWithMailInfo(user) {
  // TODO update table reminders
  var statementUpdateReminders = db.prepare('INSERT INTO reminders (groupurl, userid, year, week) VALUES (?,?,?,?)', user.groupurl, user.userid, year, week);
  statementUpdateReminders.run(function (error){
    if (error) {
      log('Failed updating reminder table for user ' + JSON.stringify(user), 'sendReminders.updateDatabaseWithMailInfo');
    }
  });
}