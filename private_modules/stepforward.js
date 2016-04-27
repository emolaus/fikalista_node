var step = {};

/**
 * Step forward each group
*/
step.forwardEntireDB = function (db, year, week) {
  
}

/** 
 * Step forward 1 group if not done since last successful fika 
*/
step.forward = function (db, groupurl, year, week) {
  // TODO Get MIN (user_order)
  // TODO Check if week and year 
}
/* PROBLEMS:
If auto script runs on monday, how does it know it hasn't stepped forward?
If server is down a few weeks, how catch up?
name    year  week  user_order
Adam    2016  17    300
Bertil  2016  16    200
Idea: in groups, add week and year to show when group was updated last.
*/
module.exports = step;