var step = {};
var dbactions = require('../private_modules/dbactions.js');
var weeklogic = require('../private_modules/weeklogic.js');
var log = require('../private_modules/mylogger').log;
var async = require('async');
/**
 * Step forward each group
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
  
  dbactions.getGroups(db, 
    function success(list) {
      async.eachSeries(list, function (group, asyncCallback) {
        var groupurl = group.groupurl;
        
        var s1 = db.prepare('SELECT *,MAX(timestamp) FROM updatescriptlastrun WHERE groupurl=?', groupurl);
        // Fetch last update
        s1.get(function (err, lastUpdate) {  
          if (err) {
            // This causes out of sync issues - same guy as last week will be responsible.
            log('Failed fetching updatescriptlastrun row for group ' + groupurl, 'step.forwardEntireDB');
            asyncCallback();
            return;
          }
          if (!lastUpdate.groupurl) {
            
            step.forward(db, groupurl, year, week, function (success, groupurl) {
              if (success) {
                log('Stepped forward ' + groupurl, 'step.forwardEntireDB');
                // Update updatescriptlastrun
                var s2 = db.prepare('INSERT INTO updatescriptlastrun (groupurl, year, week) VALUES (?,?,?)', groupurl, year, week);
                s2.run(function (err) {
                  if (err) log('Failed inserting row into updatescriptlastrun for group '+ groupurl, 'step.forwardEntireDB');
                  asyncCallback();
                });
              }
              else {
                log('Failed stepping forward ' + groupurl,'step.forwardEntireDB');
                asyncCallback();
              }
            });
          } else {
            // TODO all weeks missing
            var yearFrom = lastUpdate.year;
            var weekFrom = lastUpdate.week;
            var diff = weeklogic.getDiffInWeeks(yearFrom, weekFrom, year, week);
            if (diff == 0) {
              // Already updated this week.
               log('Skipped stepping forward ' + groupurl,'step.forwardEntireDB');
               asyncCallback();
            }
            else if (diff < 0) {
              log('Error checking week diff for group ' + groupurl);
              asyncCallback();
            }
            else {
              // diff > 0. For each, update.
              var arrayOfDiffLength = new Array(diff);
              var tmpyearweek = {year: yearFrom, week: weekFrom};
              for (var i = 0; i < diff; i++) {
                tmpyearweek = weeklogic.getWeekAfter(tmpyearweek.year, tmpyearweek.week);
                arrayOfDiffLength[i] = {year: tmpyearweek.year, week: tmpyearweek.week};
              }
              async.eachSeries(arrayOfDiffLength, function (yearweek, asyncCallback2) {
                step.forward(db, groupurl, yearweek.year, yearweek.week, function (success, groupurl) {
                  if (success) {
                    log('Stepped forward ' + groupurl, 'step.forwardEntireDB');
                    // Update updatescriptlastrun
                    var s2 = db.prepare('INSERT INTO updatescriptlastrun (groupurl, year, week) VALUES (?,?,?)', groupurl, yearweek.year, yearweek.week);
                    s2.run(function (err) {
                      if (err) log('Failed inserting row into updatescriptlastrun for group '+ groupurl, 'step.forwardEntireDB');
                      asyncCallback2();
                    });
                  }
                  else {
                    log('Failed stepping forward ' + groupurl,'step.forwardEntireDB');
                    asyncCallback2();
                  }
                });
              }, function done() {
                log('Multiple steps forward for group ' + groupurl);
                asyncCallback();
              });
            }
          }
        });
      }, function done() {
        callback();
      }); // end async callback
      
    }, function error(msg) {
      log('Error fetching groups. error message: ' + msg, 'stepforward.forwardEntireDB');
      callback();
  });
};
/** 
 * Step forward 1 group, 1 week if not done since last successful fika 
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