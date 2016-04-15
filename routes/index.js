var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:groupurl/mainview', function (req, res, next) {
    console.log(req.params.groupurl + ' visited');
    res.render('mainview', {
        groupurl: req.params.groupurl, 
        list: [{week: 10, name: 'Mattias'}, {week: 11, name: 'Kalle'}],
        slist: [1,2,3]
    });
});

module.exports = router;
