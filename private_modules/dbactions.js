var logger = require('../private_modules/mylogger');
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
dbactions.getUsersFromGroupUrl = function(db, groupurl, successCallback, errorCallback) {
  // get current group
  dbactions.getGroup(db, groupurl, function (group) {
    var statement = db.prepare('SELECT * FROM users WHERE groupurl=? ORDER BY user_order ASC', group.groupurl);
    log('getUsersFromGroupUrl', 'SELECT * FROM users WHERE groupurl=' + group.groupurl + ' ORDER BY user_order ASC');
    statement.all(function(err, users) {
      if (err) {
        console.log('Error at dbactions.getUsersFromGroupUrl: db query get users failed for group: ');
        console.log(group);
        errorCallback(err);
        return;
      }
      successCallback(users);
    });    
  }, errorCallback);
};

dbactions.getWeekExceptions = function(db, groupurl, fromyear, fromweek, successCallback, errorCallback) {
  // Check group exists 
  dbactions.getGroup(db, groupurl, function (group) {
    // Get weeks later than the current week
    var statement = db.prepare('SELECT week, year FROM skipweeks WHERE year >= ? AND week >= ? ORDER BY year ASC, week ASC', fromyear, fromweek);
    log('getWeekExceptions', 'SELECT week, year FROM skipweeks WHERE year >= ' + fromyear + ' AND week >= ' + fromweek + ' ORDER BY year ASC, week ASC');
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
module.exports = dbactions;