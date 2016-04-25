var express = require('express');
var router = express.Router();

var dbactions = require('../private_modules/dbactions');
var weeklogic = require('../private_modules/weeklogic');
var currentWeekNumber = require('current-week-number');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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
      console.log(result);
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



router.put('/weekexception/:groupurl/:year/:week', function (req, res) {
  dbactions.addWeekException(req.db, req.params.groupurl, req.params.year, req.params.week, 
    function success() {
      res.send();
    }, function error(msg) {
      res.send(msg);
    });
});

module.exports = router;
