var express = require('express');
var router = express.Router();
var path  = require('path');
var test = path.resolve(__dirname,'../test');
// console.log(dirpath);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(test+'/index.html');
});

router.get('/script.js', function(req, res, next) {
  res.sendFile(test+'/script.js');
});

module.exports = router;
