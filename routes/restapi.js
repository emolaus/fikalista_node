var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/database.db');
console.log('restapi cached db');

router.get('/:groupurl/users', function(req, res, next) {
  res.send(JSON.stringify({name: 'Kalle'}));
});
router.get('/test', function (req, res, next) {
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

module.exports = router;
