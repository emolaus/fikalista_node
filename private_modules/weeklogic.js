var weeklogic = {};
var dbactions = require('../private_modules/dbactions');
var currentWeekNumber = require('current-week-number');
var config = require('../config/config');
var reload = require('require-reload')(require);

weeklogic.userListWithWeeks = function(db, groupurl, successCallback, errorCallback) {

  dbactions.getUsers(db, groupurl, function success(users) {
    // Fetch weeks and assign week to each user.
    var now = weeklogic.getCurrentWeek();
    var checkYear =now.year;
    var checkWeek = now.week;
    dbactions.getWeekExceptions(db, groupurl, checkYear, checkWeek, function success(weeks) {
      for (var i = 0; i < users.length; i++) {
        // If checkweek is in the list of week exceptions, step forward.
        while (weekShouldBeSkipped(checkYear, checkWeek, weeks)) {
          //checkWeek = new Date(checkWeek.getTime() + stepWeekMilliseconds);
          var next = weeklogic.getWeekAfter(checkYear, checkWeek);
          checkYear = next.year;
          checkWeek = next.week;
        }
        users[i].week = checkWeek;
        var next = weeklogic.getWeekAfter(checkYear, checkWeek);
        checkYear = next.year;
        checkWeek = next.week;
      }
      successCallback(users);
    }, errorCallback);
  }, errorCallback);
};

function weekShouldBeSkipped(year, week, weekExceptionList) {
  //var year = date.getFullYear();
  //var week = currentWeekNumber(date);
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
      // Test mode? Reload week numbers
      if (config.TESTMODE) {
        config = null;
        config = reload('../config/config');
      }
      console.log('testweek: ' + config.TESTWEEK);
      var currentYear = config.TESTMODE ? config.TESTYEAR : now.getFullYear();
      var currentWeek = config.TESTMODE ? config.TESTWEEK : currentWeekNumber();
      return {year: currentYear, week: currentWeek};
}

weeklogic.getWeekBefore = function (year, week) {
  if (week > 1) return {year: year, week: week - 1};
  var prevYear = year - 1;
  if (week == 1) return {year: prevYear, week: currentWeekNumber(new Date('December 28, ' + prevYear))};
};

weeklogic.stepNWeeksBack = function (year, week, numberOfWeeks) {
  var yearWeek = {year: year, week: week};
  for (var i = 0; i < numberOfWeeks; i++) {
    yearWeek = weeklogic.getWeekBefore(yearWeek.year, yearWeek.week);
  }
  return yearWeek;
};

weeklogic.getWeekAfter = function(year, week) {
  if (week == weeklogic.getLastWeekOfTheYear(year)) {
    return {year: year + 1, week: 1};
  }
  return {year: year, week: week + 1};
}

weeklogic.getLastWeekOfTheYear = function (year) {
  return currentWeekNumber(new Date('December 28, ' + year));
}
/**
 * example
 * weeklogic.getDiffInWeeks(2016, 1, 2015, 53) => -1
 * weeklogic.getDiffInWeeks(2016, 10, 2016, 12) => 2
*/
weeklogic.getDiffInWeeks = function(yearFrom, weekFrom, yearTo, weekTo) {
  if (yearFrom == yearTo && weekFrom == weekTo) return 0;
  var stepper, direction, diff = 0;
  if ((yearFrom*100 + weekFrom) < (yearTo*100 + weekTo)) {
    stepper = weeklogic.getWeekAfter;
    direction = 1;
  } else {
    stepper = weeklogic.getWeekBefore;
    direction = -1;
  }
  // TODO step forward until same
  var current = {year: yearFrom, week: weekFrom};
  while (!(yearTo==current.year && weekTo == current.week) ) {
    current = stepper(current.year, current.week);
    diff++;
  }
  return direction * diff;
};
module.exports = weeklogic;