var express = require('express');
var router = express.Router();

var dbactions = require('../bin/dbactions');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:groupurl/mainview', function (req, res, next) {
    console.log(req.params.groupurl + ' visited');
    dbactions.getUsersFromGroupUrl(
    req.db, 
    req.params.groupurl, 
    function success(users, group) {
      res.render('mainview', {
        groupurl: req.params.groupurl, // Not used, ditched angular
        list: users,
        groupname: group.name
      });
    },
    function error(msg) {
      res.send(msg);
    });
    
});

module.exports = router;
