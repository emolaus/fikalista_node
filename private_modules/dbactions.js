var logger = require('../private_modules/mylogger');
var currentWeekNumber = require('current-week-number');

var dbactions = {};
function log(callingFunction, msg) {
  logger.log('dbactions.' + callingFunction);
  logger.log(msg);
}

dbactions.getGroup = function (db, groupurl, successCallback, errorCallback) {
  var statement = db.prepare("SELECT * FROM groups WHERE groupurl=?", groupurl);
  log('getGroup', "SELECT * FROM groups WHERE groupurl="+ groupurl);
  statement.all(function (err, res) {
    if (err) {
      console.log('Error at dbactions.getGroupId: db query get group failed for groupurl ' + groupurl);
      console.log(group);
      errorCallback(err);
      return;
    }
    if (res.length == 0) {
      console.log('Group ' + groupurl + 'not found at dbactions.getGroupId');
      errorCallback('Group not found in database.');
      return;
    }
    var group = res[0];
    successCallback(group);
  });
};
dbactions.getUsers = function(db, groupurl, successCallback, errorCallback) {
  // get current group
  dbactions.getGroup(db, groupurl, function (group) {
    var statement = db.prepare('SELECT * FROM users WHERE groupurl=? ORDER BY user_order ASC', group.groupurl);
    log('getUsers', 'SELECT * FROM users WHERE groupurl=' + group.groupurl + ' ORDER BY user_order ASC');
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
  var statement = db.prepare('DELETE FROM users WHERE groupurl=? AND userid=?', groupurl, userid);
  log('deleteUser', 'DELETE FROM users WHERE groupurl=' + groupurl + ' AND userid=' + userid);
  statement.run(function (err) {
    if (err) errorCallback('Failed deleting user.');
    else successCallback();
  });
};

dbactions.addUser = function(db, groupurl, name, email, successCallback, errorCallback) {
  // TODO get max user_order. Set 100 over. Doesn't work.
  var statement = db.prepare('SELECT MAX(user_order) FROM users WHERE groupurl=?', groupurl);
  log('addUser', 'SELECT MAX(user_order) FROM users WHERE groupurl=' + groupurl);
  statement.run(function (err, res) {
    if (err) {
      console.log('error;');
      console.log(err);
    }
    console.log('addUser result:');
    console.log(res);
  });
  /*var statement = db.prepare('INSERT INTO users (groupurl, name, email) email=? WHERE userid=?', name, email, userid);
  log('editUser', 'UPDATE users SET name=' + name + ', email=' + email + ' WHERE userid=' + userid);
  statement.run(function (err) {
    if (err) errorCallback('Failed updating user.');
    else successCallback();
  });*/
};

dbactions.editUser = function(db, userid, name, email, successCallback, errorCallback) {
  var statement = db.prepare('UPDATE users SET name=?, email=? WHERE userid=?', name, email, userid);
  log('editUser', 'UPDATE users SET name=' + name + ', email=' + email + ' WHERE userid=' + userid);
  statement.run(function (err) {
    if (err) errorCallback('Failed updating user.');
    else successCallback();
  });
};
module.exports = dbactions;