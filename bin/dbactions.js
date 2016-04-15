var dbactions = {};
dbactions.getUsersFromGroupUrl = function(db, groupurl, successCallback, errorCallback) {
  // get current group
  var statement = db.prepare("SELECT * FROM groups WHERE groupurl=?", groupurl);
  console.log("HERE");
  console.log(groupurl);
  console.log(statement);
  
  statement.all(function (err, res) {
    
    if (err) {
      console.log('Error at dbactions.getUsersFromGroupUrl: db query get group failed for groupurl ' + groupurl);
      console.log(group);
      errorCallback(err);
      return;
    }
    var group = res[0];
    statement = db.prepare('SELECT * FROM users WHERE groupid=?', group.groupid);
    statement.all(function(err, res) {
      if (err) {
        console.log('Error at dbactions.getUsersFromGroupUrl: db query get users failed for group');
        console.log(group);
        errorCallback(err);
        return;
      }
      successCallback(res);
    });
  });
};

module.exports = dbactions;