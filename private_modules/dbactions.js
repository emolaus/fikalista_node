var logger = require('../private_modules/mylogger');
var currentWeekNumber = require('current-week-number');

var dbactions = {};
function log(callingFunction, msg) {
  logger.log('dbactions.' + callingFunction);
  logger.log(msg);
}

dbactions.getGroup = function (db, groupurl, successCallback, errorCallback) {
  var statement = db.prepare("SELECT * FROM groups WHERE groupurl=?", groupurl);
  statement.all(function (err, res) {
    if (err) {
      console.log('Error at dbactions.getGroupId: db query get group failed for groupurl ' + groupurl);
      errorCallback(err);
      return;
    }
    if (res.length == 0) {
      log('Group ' + groupurl + 'not found at dbactions.getGroupId');
      errorCallback('getGroup','Group not found in database.');
      return;
    }
    var group = res[0];
    successCallback(group);
  });
};
dbactions.getGroups = function(db, successCallback, errorCallback) {
  db.all('SELECT * FROM groups', function (err, list) {
    if (err) errorCallback(err);
    else successCallback(list);
  });
}
dbactions.getUsers = function(db, groupurl, successCallback, errorCallback) {
  // get current group
  dbactions.getGroup(db, groupurl, function (group) {
    var statement = db.prepare('SELECT * FROM users WHERE groupurl=? ORDER BY user_order ASC', group.groupurl);
    statement.all(function(err, users) {
      if (err) {
        console.log('Error at dbactions.getUsers: db query get users failed for group: ');
        console.log(group);
        errorCallback(err);
        return;
      }
      successCallback(users);
    });    
  }, errorCallback);
};

dbactions.getWeekExceptions = function(db, groupurl, fromYear, fromWeek, successCallback, errorCallback) {
  // Check group exists 
  dbactions.getGroup(db, groupurl, function (group) {
    // Get weeks later than the current week
    // tricky - sorting works but how to exclude
    var statement = db.prepare('SELECT id, week, year FROM skipweeks WHERE groupurl=? AND( (year > ?) OR (year = ? AND week >= ?)) ORDER BY year ASC, week ASC', groupurl, fromYear, fromYear, fromWeek);
    statement.all(function (err, res) {
      if (err) {
        errorCallback(err);
        return;
      }
      successCallback(res);
    });
  }, 
  errorCallback);
  
};

dbactions.getCurrentWeek = function () {
      var now = new Date();
      var currentYear =now.getFullYear();
      var currentWeek = currentWeekNumber();
      return {year: currentYear, week: currentWeek};
}

dbactions.addWeekException = function (db, groupurl, year, week, successCallback, errorCallback) {
  var statement = db.prepare('INSERT INTO skipweeks (groupurl, week, year) VALUES (?, ?, ?)', groupurl, week, year);
  log('addWeekException', 'INSERT INTO skipweeks (groupurl, week, year) VALUES (' + groupurl + ',' + week + ',' + year + ')');
    
  statement.run(function (err) {
    if (err) errorCallback('Failed inserting data');
    else successCallback();
  });
  
}

dbactions.deleteWeekException = function(db, groupurl, weekid, successCallback, errorCallback) {
  var statement = db.prepare('DELETE FROM skipweeks WHERE groupurl=? AND id=?', groupurl, weekid);
  log('deleteWeekException', 'DELETE FROM skipweeks WHERE groupurl=' + groupurl + ' AND id=' + weekid);
  statement.run(function (err) {
    if (err) errorCallback('Failed deleting week exception.');
    else successCallback();
  });
};

dbactions.deleteUser = function(db, groupurl, userid, successCallback, errorCallback) {
  // begin with deleting the reminders, or foreign key constraints will block delete statement
  log('deleteUser', 'DELETE FROM reminders WHERE groupurl=' + groupurl + ' AND userid=' + userid);
  var clearRemindersStatement = db.prepare('DELETE FROM reminders WHERE groupurl=? AND userid=?', groupurl, userid);
  clearRemindersStatement.run(function (err) {
    if (err) errorCallback('Failed deleting user.');
    else {
      var deleteUserStatement = db.prepare('DELETE FROM users WHERE groupurl=? AND userid=?', groupurl, userid);
      log('deleteUser', 'DELETE FROM users WHERE groupurl=' + groupurl + ' AND userid=' + userid);
      deleteUserStatement.run(function (err) {
        if (err) errorCallback('Failed deleting user.');
        else successCallback();
      });      
    }
  });
  
};

dbactions.addUser = function(db, groupurl, name, email, successCallback, errorCallback) {
  // TODO get max user_order. Set 100 over. Doesn't work.
  var statement = db.prepare('SELECT MAX(user_order) FROM users WHERE groupurl=?', groupurl);
  statement.get(function (err, res) {
    if (err) {
      errorCallback(err);
      return;
    }
    var maxOrder = res['MAX(user_order)']
    var newMaxOrder = maxOrder + 100;
    var statement2 = db.prepare('INSERT INTO users (groupurl, name, user_order, email) VALUES (?,?,?,?)', groupurl, name, newMaxOrder, email);
    statement2.run(function (err) {
      if (err) errorCallback(err);
      else successCallback();
    });
  });
};

dbactions.editUser = function(db, userid, name, email, successCallback, errorCallback) {
  var statement = db.prepare('UPDATE users SET name=?, email=? WHERE userid=?', name, email, userid);
  statement.run(function (err) {
    if (err) errorCallback('Failed updating user.');
    else successCallback();
  });
};
dbactions.checkReminder = function(db, groupurl, userid, year, week, successCallback, errorCallback) {
  var statement = db.prepare('SELECT * FROM reminders WHERE groupurl=? AND userid=? AND year=? AND week=?', groupurl, userid, year, week);
  statement.get(function (err, row) {
    if (err) {
      errorCallback(err);
      console.log('checkReminder error:');
      console.log(err);
      log('checkReminder', 'Failed finding reminder.');
    }
    successCallback(row);
  });
};

/**
 * This is working but it's not elegant. I just don't know how
 * to work with serialize + transactions. 
 */
dbactions.switchWeeks = function (db, groupurl, userid1, userid2, successCallback, errorCallback) {
  // Check so that users belong to same group
  // 3 changes to DB so use transaction:
  // get user_order for both users
  // switch user_order
  // update groups(year, week, userid)
  var s1 = db.prepare('SELECT * FROM users where groupurl=? AND (userid=? OR userid=?)', groupurl, userid1, userid2);
  s1.all(function (err, users) {
    if (err) {
      errorCallback(err);
      return;
    }
    if (users.length != 2) {
      errorCallback('Found wrong number of users.');
      log('changeWeeks', 'Found wrong number of users. groupurl: ' + groupurl + ' userid1: ' + userid1 + ' userid2: ' + userid2);
      return;
    }
    var user1 = users[0].userid == userid1 ? users[0] : users[1];
    var user2 = users[1].userid == userid2 ? users[1] : users[0];
    // At this point we're good to go.
    db.run('BEGIN');
    var s2 = db.prepare('UPDATE users SET user_order=? WHERE userid=?', user2.user_order, user1.userid);
    s2.run(function (error) {
      if (error) {
        log('switchWeeks', 'error at switch 1: ' + error);
        log('switchWeeks', 'continued. groupurl: ' + groupurl + ' userid1: ' + userid1 + ' userid2: ' + userid2);
        db.run('ROLLBACK');
        errorCallback('Failed updating in database for user 1');
      } else {
        var s3 = db.prepare('UPDATE users SET user_order=? WHERE userid=?', user1.user_order, user2.userid);
        s3.run(function (error) {
          if (error) {
            log('switchWeeks', 'error at switch 2: ' + error);
            log('switchWeeks', 'continued. groupurl: ' + groupurl + ' userid1: ' + userid1 + ' userid2: ' + userid2)
            db.run('ROLLBACK');
            errorCallback('Failed updating in database for user 2');
            return;
          } 
          db.run('COMMIT');
          successCallback();
        });
      }
    });
  });
};
module.exports = dbactions;
