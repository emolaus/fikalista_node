var step = {};
var dbactions = require('../private_modules/dbactions.js');
var weeklogic = require('../private_modules/weeklogic.js');
/**
 * Step forward each group
*/
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
    callback(false, groupurl);
  }
  }); 
}
module.exports = step;