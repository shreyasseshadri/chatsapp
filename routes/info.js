var express = require('express');
var router = express.Router();
const passport = require("passport");

router.get("/",function(req,res,next){
    res.send(req.isAuthenticated());
});

module.exports = router;
