var dbactions = {};
dbactions.getGroup = function (db, groupurl, successCallback, errorCallback) {
  var statement = db.prepare("SELECT * FROM groups WHERE groupurl=?", groupurl);
  
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
    var statement = db.prepare('SELECT * FROM users WHERE groupid=?', group.groupid);
    statement.all(function(err, res) {
      if (err) {
        console.log('Error at dbactions.getUsersFromGroupUrl: db query get users failed for group: ');
        console.log(group);
        errorCallback(err);
        return;
      }
      successCallback(res, group);
    });    
  }, errorCallback);
};

dbactions.getWeekExceptions = function(db, groupid, successCallback, errorCallback) {
  // TODO
};
module.exports = dbactions;