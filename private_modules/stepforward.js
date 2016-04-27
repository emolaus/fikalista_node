var step = {};
var dbactions = require('../private_modules/dbactions.js');
var weeklogic = require('../private_modules/weeklogic.js');
/**
 * Step forward each group
*/
step.forwardEntireDB = function (db, year, week) {
  // Then, check if script has run this week. If not, go through each group.
  var s1 = db.prepare('SELECT * FROM updatescriptlastrun WHERE year=? AND week=?', year, week);
  s1.get(function (err, res) {
    if (err) log('Error fetching from updatescriptlastrun. year: ' + year + ' week:' + week, 'stepforward.forwardEntireDB');
    else if (!res) {
      var s2 = db.prepare('INSERT INTO updatescriptlastrun (year, week) VALUES (?,?)', year, week);
      s2.run(function (err) {
        // TODO backup db.
        if (err)  log('Error inserting in updatescriptlastrun. year: ' + year + ' week:' + week, 'stepforward.forwardEntireDB');
        else { // for each group, step forward
          dbactions.getGroups(db, function success(list) {
            console.log('Stepping forward groups...');
            db.serialize(function () {
              for (var i = 0; i < list.length; i++) {
                var groupurl = list[i].groupurl;
                step.forward(db, groupurl, year, week, function (res) {
                  if (res) console.log('Stepped forward ' + groupurl);
                  else console.log('Failed stepping forward ' + groupurl);
                  
                });
              }
            });
          }, function error(msg) {
            log('Error fetching groups. error message: ' + msg, 'stepforward.forwardEntireDB');
          });
        }
      });
    } else {
      // This week has already been updated.
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
      callback(false);
    } else if (!res) {
      // At this point, there was no week exception last week and we're free to step forward.
      var s2 = db.prepare('SELECT userid, user_order, MAX(user_order) AS max_user_order, MIN(user_order) FROM users WHERE groupurl=?', groupurl);
      s2.get(function (err, user) {
        if (err || !user) {
          log('Failed fetching MIN(user_order) for user with groupurl: ' + groupurl, 'stepforward.forward');
          callback(false);
        } else {
          db.run('UPDATE users SET user_order=? WHERE groupurl=? AND userid=?', user.max_user_order + 100, groupurl, user.userid, function (err) {
            if (err) log('Failed stepping forward user: ' + JSON.stringify(user));
            s2.finalize();
            callback(true);
          });
        }
      });
    } else {
    console.log('Skipped stepping forward ' + groupurl);
  }
  }); 
}

/* PROBLEMS:
If auto script runs on monday, how does it know it hasn't stepped forward?
If server is down a few weeks, how catch up?
name    year  week  user_order
Adam    2016  17    300
Bertil  2016  16    200
Idea: 

table groups, monday w16. Only one
week userid
15   3
16   2     <---- changed
16   1    
-Do nothing
w17 -> step forward.
- What happens if exception is added/removed and script hasn't run yet?
Say, w16: exception for w16 and 17 exist so table says
18   3
Then w 17 is removed from exceptions.
=> recalculate groups(week)
- Must also be done when switching users.

ENKLARE: tabell scriptlastrun med year, week, timestamp.
PROBLEM: Om grupp läggs till INNAN script körs kommer gruppen skjutas fram.
MANUELL LÖSNING: kör script innan grupp läggs till.
*/
module.exports = step;