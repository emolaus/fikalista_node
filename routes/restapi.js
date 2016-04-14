var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
console.log('restapi cached db');

router.get('/groups', function (req, res, next) {
  db.all('SELECT * FROM groups;', function (err, data) {
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

  var statement = db.prepare("SELECT * FROM groups WHERE url_name=?", req.params.groupurl);
  statement.bind(req.params.groupurl);
  statement.all(function (err, rows) {
    if (err) {
      console.log('error reading db in route /users/:groupurl');
      res.send('Error reading db');
      return;
    }
    if (rows.length == 0) {
      res.send('group not found.');
      return;
    }
    // Get all users of that group or return error
    db.all('SELECT * FROM users where groupid=' + rows[0].groupid, function (err, rows) {
      if (err) {
        console.log('Error reading db table users in route /users/:groupurl');
        res.send('Error fetching users.');
        return;
      }
      res.send(rows);
    });
  });
});

module.exports = router;
