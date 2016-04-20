var express = require('express');
var router = express.Router();

var dbactions = require('../bin/dbactions');
var weeklogic = require('../bin/weeklogic');

router.get('/weeklist/:groupurl', function (req, res) {
  console.log('/weekexceptions/:groupurl/:year/:week');
  weeklogic.userListWithWeeks(req.db, req.params.groupurl,
  function successCallback(list) {
    res.send(list);
  },
  function error() {
    res.send();
  });  
});
router.get('/weekexceptions/:groupurl/:year/:week', function (req, res) {
  console.log('/weekexceptions/:groupurl/:year/:week');
  dbactions.getWeekExceptions(req.db, req.params.groupurl, req.params.year, req.params.week, 
  function success(list) {
    res.send(list);
  }, 
  function error() {
    res.send();
  });
});

router.get('/group/:groupurl', function (req, res) {
  dbactions.getGroup(req.db, req.params.groupurl,
  function success(group) {
    res.send(group);
  },
  function error() {
    res.send();
  });
});

router.get('/groups', function (req, res, next) {
  req.db.all('SELECT * FROM groups;', function (err, data) {
    if (err) {
      console.log('Error retrieving data!');
      res.send(err);
    }
    else {
      res.send(data);
    }
  });
});
router.get('/users/:groupurl', function (req, res, next) {
  // Check so that groupurl exists
  dbactions.getUsersFromGroupUrl(
    req.db, 
    req.params.groupurl, 
    function success(rows) {
      res.send(rows);
    },
    function error(msg) {
      res.send(msg);
    });
});

module.exports = router;
