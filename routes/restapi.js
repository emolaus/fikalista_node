var express = require('express');
var router = express.Router();

var dbactions = require('../bin/dbactions');
console.log('restapi cached db');

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
