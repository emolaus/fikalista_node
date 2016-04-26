var express = require('express');
var router = express.Router();

var dbactions = require('../private_modules/dbactions');
var weeklogic = require('../private_modules/weeklogic');
var currentWeekNumber = require('current-week-number');

router.get('/:groupurl/mainview', function (req, res, next) {
    dbactions.getGroup(req.db, req.params.groupurl, 
    function successCallback(group) {
      weeklogic.userListWithWeeks(req.db, req.params.groupurl, 
      function successCallback(users) {
         res.render('mainview', {
          groupurl: req.params.groupurl, // Not used, ditched angular
          list: users,
          groupname: group.name
        });
      },
      function errorCallback() {
        res.send("Failed Fetching page");
      });
    },
    function errorCallback() {
      res.send("Group not found");
    });
});

router.get('/:groupurl/manageweeks', function (req, res) {
  var now = weeklogic.getCurrentWeek();
  var nextException = now; // Best guess if following line fails
  weeklogic.getNextWeekException(req.db, req.params.groupurl, now.year, now.week, 
    function result(err, result) {
      if (!err) nextException = result;
      dbactions.getWeekExceptions(req.db, req.params.groupurl, now.year, now.week, function success(weeks) {
          res.render('manageweeks', {
            weeks: weeks,
            defaultAddYear: nextException.year,
            defaultAddWeek: nextException.week,
            groupurl: req.params.groupurl
          });
        }, function error(msg) {
          res.send(msg);
        });
  });
});

router.get('/:groupurl/manageusers', function (req, res) {
  dbactions.getUsers(req.db, req.params.groupurl, function success(allUsers) {
    
    console.log(allUsers);
    res.render('manageusers', {
      groupurl: req.params.groupurl,
      allUsers: allUsers
  });  
  }, function error() {
    res.render('Error when reading database.');
  });
  
});


router.put('/weekexception/:groupurl/:year/:week', function (req, res) {
  dbactions.addWeekException(req.db, req.params.groupurl, req.params.year, req.params.week, 
    function success() {
      res.send();
    }, function error(msg) {
      res.send(msg);
    });
});

router.delete('/weekexception/:groupurl/:weekid', function (req, res) {
  dbactions.deleteWeekException(req.db, req.params.groupurl, req.params.weekid, 
    function success() {
      res.send();
    }, function error(msg) {
      res.send(msg);
    });
});

router.delete('/user/:groupurl/:userid', function (req, res) {
  dbactions.deleteUser(req.db, req.params.groupurl, req.params.userid, 
    function success() {
      res.send();
    }, function error(msg) {
      res.send(msg);
    });
});

router.put('/adduser/:groupurl/:name/:email?', function (req, res) {
  var email = req.params.email;
  if (!email) email = "";
  console.log('req.params:'); console.log(req.params);
  dbactions.addUser(req.db, req.params.groupurl, req.params.name, email, 
  function success() {
    res.send();
  }, function error(msg) {
    res.send(msg);
  });
});

router.put('/user/:userid/:name/:email?', function (req, res) {
  var email = req.params.email;
  if (!email) email = "";
  dbactions.editUser(req.db, req.params.userid, req.params.name, req.params.email, 
  function success() {
    res.send();
  }, function error(msg) {
    res.send(msg);
  });
});

module.exports = router;

/* TODO list
do not accept empty name
check so that name isn't taken on add user or edit users
felhantering i client js, nåt meddelande
efter add, remove, edit, change: meddelande till användare
*/
