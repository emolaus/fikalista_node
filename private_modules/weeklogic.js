var weeklogic = {};
var dbactions = require('../private_modules/dbactions');
var currentWeekNumber = require('current-week-number');
weeklogic.userListWithWeeks = function(db, groupurl, successCallback, errorCallback) {
  // Get group id
  dbactions.getGroup(db, groupurl, function success(group) {
    dbactions.getUsersFromGroupUrl(db, groupurl, function success(users) {
      // Fetch weeks and assign week to each user.
      var now = new Date();
      var currentYear =now.getFullYear();
      var currentWeek = currentWeekNumber();
      var checkWeek = new Date();
      var stepWeekMilliseconds = 7 * 24 * 3600 * 1000;
      dbactions.getWeekExceptions(db, groupurl, currentYear, currentWeek, function success(weeks) {
        for (var i = 0; i < users.length; i++) {
          // If checkweek is in the list of week exceptions, step forward.
          while (weekShouldBeSkipped(checkWeek, weeks)) {
            checkWeek = new Date(checkWeek.getTime() + stepWeekMilliseconds);
          }
          users[i].week = currentWeekNumber(checkWeek);
          checkWeek = new Date(checkWeek.getTime() + stepWeekMilliseconds);
        }
        successCallback(users);
      }, 
      errorCallback);
    }, errorCallback);
  },
  errorCallback);
  // Get complete list
};

function weekShouldBeSkipped(date, weekExceptionList) {
  var year = date.getFullYear();
  var week = currentWeekNumber(date);
  for (var i = 0; i < weekExceptionList.length; i++) {
    if (weekExceptionList[i].year == year && weekExceptionList[i].week == week) {
      return true;
    }
  }
  return false;
}

module.exports = weeklogic;