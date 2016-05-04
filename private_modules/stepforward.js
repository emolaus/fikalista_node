var step = {};
var dbactions = require('../private_modules/dbactions.js');
var weeklogic = require('../private_modules/weeklogic.js');
var log = require('../private_modules/mylogger').log;
var async = require('async');
/**
 * Step forward each group
 * TODO if it was several weeks since update was run, step multiple times
 * 
 * Test sequence
 * set w 15. Should see 15 A, 15 A, 15 A. OK
 * step forward. Should se 15 B, 15 B, 15 B and mail to B,B,B. OK database1
 * set w 16. step forward. Should see 16 C, 17 C, 19 C and mail to C, OK database2
 * set w 17. step forward. Should see 17 A, 17 C, 19 C and mail to A, C, OK database3
 * set w 18. step forward. Should see 18 B, 18 A, 19 C and mail to B, A OK database4
 * set w 19. step forward. Should see 19 C, 19 B, 19 C and mail to C, B, C OK database5
 * set w 20. step forward. Should see 20 A, 20 C, 20 A and mail to A, C, A 
*/
step.forwardEntireDB = function (db, year, week, callback) {
  var length;
  var countAndReturn = function () {
    console.log('Remaining calls: ' + --length);
    if (length == 0) callback();
  };
  dbactions.getGroups(db, 
    function success(list) {
      length = list.length;
      
      async.eachSeries(list, function (group, callback) {
        var groupurl = group.groupurl;
        var s1 = db.prepare('SELECT * FROM updatescriptlastrun WHERE groupurl=? AND year=? AND week=?', groupurl, year, week);
        // Check if this group is already updated this week
        s1.get(function (err, res) {   
          if (err) {
            // This causes out of sync issues - same guy as last week will be responsible.
            log('Failed fetching updatescriptlastrun row for group ' + groupurl, 'step.forwardEntireDB');
            callback();
          }
          // !res means the group has not been updated yet.
          else if (!res) {
            step.forward(db, groupurl, year, week, function (success, groupurl) {
              if (success) {
                log('Stepped forward ' + groupurl, 'step.forwardEntireDB');
                // Update updatescriptlastrun
                var s2 = db.prepare('INSERT INTO updatescriptlastrun (groupurl, year, week) VALUES (?,?,?)', groupurl, year, week);
                s2.run(function (err) {
                  if (err) log('Failed inserting row into updatescriptlastrun for group '+ groupurl, 'step.forwardEntireDB');
                  countAndReturn();
                  callback();
                });
              }
              else {
                log('Skipped stepping forward ' + groupurl,'step.forwardEntireDB');
                countAndReturn();
                callback();
              }
            });
          }
          // If we arrive here the group had already been updated.
          else {
            log('Group ' + groupurl + ' has already been updated this week (year: ' + year + ', week: ' + week, 'step.forwardEntireDB');
            countAndReturn();
          }
        });
      }); // end async callback
      
    }, function error(msg) {
    log('Error fetching groups. error message: ' + msg, 'stepforward.forwardEntireDB');
    callback();
  });
};
      /*
      for (var i = 0; i < list.length; i++) {
        var groupurl = list[i].groupurl;
        var s1 = db.prepare('SELECT * FROM updatescriptlastrun WHERE groupurl=? AND year=? AND week=?', groupurl, year, week);
        // Check if this group is already updated this week
        s1.get(function (err, res) {   
        if (err) {
          // This causes out of sync issues - same guy as last week will be responsible.
          log('Failed fetching updatescriptlastrun row for group ' + groupurl, 'step.forwardEntireDB');
          countAndReturn();
        }
        // !res means the group has not been updated yet.
        else if (!res) {
          step.forward(db, groupurl, year, week, function (success, groupurl) {
            if (success) {
              log('Stepped forward ' + groupurl, 'step.forwardEntireDB');
              // Update updatescriptlastrun
              var s2 = db.prepare('INSERT INTO updatescriptlastrun (groupurl, year, week) VALUES (?,?,?)', groupurl, year, week);
              s2.run(function (err) {
                if (err) log('Failed inserting row into updatescriptlastrun for group '+ groupurl, 'step.forwardEntireDB');
                countAndReturn();
              });
            }
            else log('Skipped stepping forward ' + groupurl,'step.forwardEntireDB');
          });
        }
        // If we arrive here the group had already been updated.
        else {
          log('Group ' + groupurl + ' has already been updated this week (year: ' + year + ', week: ' + week, 'step.forwardEntireDB');
          countAndReturn();
        }
        
      });     
    }*/

/*
step.forwardEntireDB = function (db, year, week, callback) {
  var length; 
  var countAndReturn = function () {
    console.log('Remaining calls: ' + --length);
    if (length == 0) callback();
  }
  
  // Then, check if script has run this week. If not, go through each group.
  var s1 = db.prepare('SELECT * FROM updatescriptlastrun WHERE year=? AND week=?', year, week);
  s1.get(function (err, res) {
    if (err) {
      log('Error fetching from updatescriptlastrun. year: ' + year + ' week:' + week, 'stepforward.forwardEntireDB');
      callback();
    } else if (!res) {
      var s2 = db.prepare('INSERT INTO updatescriptlastrun (year, week) VALUES (?,?)', year, week);
      s2.run(function (err) {
        // TODO backup db.
        if (err)  {
          log('Error inserting in updatescriptlastrun. year: ' + year + ' week:' + week, 'stepforward.forwardEntireDB');
          callback();
        } else { // for each group, step forward
          dbactions.getGroups(db, function success(list) {
            db.serialize(function () {
              length = list.length;
              for (var i = 0; i < list.length; i++) {
                var groupurl = list[i].groupurl;
                step.forward(db, groupurl, year, week, function (res, groupurl) {
                  if (res) console.log('Stepped forward ' + groupurl);
                  else console.log('Failed/skipped stepping forward ' + groupurl);
                  countAndReturn();
                });
              }
            });
          }, function error(msg) {
            log('Error fetching groups. error message: ' + msg, 'stepforward.forwardEntireDB');
            callback();
          });
        }
      });
    } else {
      // This week has already been updated.
      callback();
    }
  });
}
*/
/** 
 * Step forward 1 group if not done since last successful fika 
 * If we're in week 17 and there was an exception last week - do not step forward.
*/
step.forward = function (db, groupurl, year, week, callback) {
  var tmp = weeklogic.getWeekBefore(year, week);
  var prevYear = tmp.year;
  var prevWeek = tmp.week;
  var s1 = db.prepare('SELECT * FROM skipweeks WHERE groupurl=? AND year=? AND week=?', groupurl, prevYear, prevWeek);
  s1.get(function (err, res) {
    if (err) {
      ('Failed checking skipweeks for groupurl: ' + groupurl + ', year: ' + prevYear + ', week: ' + prevWeek);
      callback(false, groupurl);
    } else if (!res) {
      // At this point, there was no week exception last week and we're free to step forward.
      var s2 = db.prepare('SELECT userid, user_order, MAX(user_order) AS max_user_order, MIN(user_order) FROM users WHERE groupurl=?', groupurl);
      s2.get(function (err, user) {
        if (err || !user) {
          log('Failed fetching MIN(user_order) for user with groupurl: ' + groupurl, 'stepforward.forward');
          callback(false, groupurl);
        } else {
          db.run('UPDATE users SET user_order=?, fika_count=fika_count+1 WHERE groupurl=? AND userid=?', user.max_user_order + 100, groupurl, user.userid, function (err) {
            if (err) log('Failed stepping forward user: ' + JSON.stringify(user));
            s2.finalize();
            callback(true, groupurl);
          });
        }
      });
    } else {
    console.log('Skipped stepping forward ' + groupurl);
    callback(true, groupurl);
  }
  }); 
}
module.exports = step;