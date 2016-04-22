var fs = require('fs');
var logger = {};
var filename = 'logs/log.txt';
/*
  Kanske smartare att kunna sätta fil/konsol via konfig? 
  Kunna sätta filnamn genom konfig?
*/
logger.log = function(msg, caller) {
  var str = (new Date()).toUTCString() + ";" + msg;
  fs.appendFile(filename, str + '\n', function (err) {
    if (err) console.log('mylogger failed writing to file.');
  });
};

module.exports = logger;