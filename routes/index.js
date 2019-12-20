var express = require('express');
var router = express.Router();
var path  = require('path');
var test = path.resolve(__dirname,'../test_interface');
// console.log(dirpath);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(test+'/login.html');
});

router.get('/message',function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/');
    //res.status(401).send("You shall not pass");
    return;
}

  res.sendFile(test+'/message.html');
});

router.get('/message.js', function(req, res, next) {
  res.sendFile(test+'/message.js');
});

module.exports = router;
