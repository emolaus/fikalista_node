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
  var now = new Date();  
  var currentYear =now.getFullYear();
  var currentWeek = currentWeekNumber();
  dbactions.getWeekExceptions(req.db, req.params.groupurl, currentYear, currentWeek, function success(weeks) {
    res.render('manageweeks', {weeks: weeks});
  }, function error(msg) {res.send(msg);});
    
  });

module.exports = router;
