var weeklogic = {};
var dbactions = require('../private_modules/dbactions');
var currentWeekNumber = require('current-week-number');
var config = require('../config/config');

weeklogic.userListWithWeeks = function(db, groupurl, successCallback, errorCallback) {
  // Get group id
  dbactions.getGroup(db, groupurl, function success(group) {
    dbactions.getUsers(db, groupurl, function success(users) {
      // Fetch weeks and assign week to each user.
      var now = weeklogic.getCurrentWeek();
      var currentYear =now.year;
      var currentWeek = now.week();
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

/**
 * Difficult to name - not what it sounds like. If the group's week exceptions from current week are
 * 2016-16
 * 2016-18
 * 
 * then the next week exception is 2016-19.
 * 
 * If there are no exceptions for current week or later, the current week is returned.
 * 
 * */
weeklogic.getNextWeekException = function (db, groupurl, fromYear, fromWeek, callback) {
  dbactions.getWeekExceptions(db, groupurl, fromYear, fromWeek, function success(weeks) {
    if (weeks.length == 0) {
      callback(null, weeklogic.getCurrentWeek());
      return;
    }
    var latest = weeks[weeks.length-1];
    // This following algorithm makes sure that we step into the next year when we 
    // increment the week in latest. 
    // 1. Get the week number of the last friday of the year
    var lastDayOfTheYear = new Date('December 31, ' + latest.year);
    var lastWeekDay = lastDayOfTheYear.getDay(); // sunday = 0 so friday = 5
    var daysToFriday = (lastWeekDay + 2) % 7;
    /* Since 
    if (lastWeekDay == 5) daysToFriday = 0;
    if (lastWeekDay == 6) daysToFriday = 1;
    if (lastWeekDay == 0) daysToFriday = 2;
    etc... */
    var dayInMilliseconds = 24*3600*1000;
    var lastFriday = new Date(lastDayOfTheYear.getTime() - dayInMilliseconds * daysToFriday);
    if ((latest.week + 1) > currentWeekNumber(lastFriday)) {
      latest.year++;
      latest.week = currentWeekNumber(new Date(lastFriday.getTime() + 7 * dayInMilliseconds));
    } else latest.week++;
    
    callback(null, latest);
  }, function error() {
    callback('failed fetching exception', null);
  });
}

weeklogic.getCurrentWeek = function () {
      var now = new Date();
      var currentYear = config.TESTMODE ? config.TESTYEAR : now.getFullYear();
      var currentWeek = config.TESTMODE ? config.TESTWEEK : currentWeekNumber();
      return {year: currentYear, week: currentWeek};
}

weeklogic.getWeekBefore = function (year, week) {
  if (week > 1) return {year: year, week: week - 1};
  var prevYear = year - 1;
  if (week == 1) return {year: prevYear, week: currentWeekNumber(new Date('December 28, ' + prevYear))};
}
module.exports = weeklogic;