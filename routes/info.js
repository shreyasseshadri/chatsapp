var express = require('express');
var router = express.Router();
const passport = require("passport");
const Users = require("../models/user");

router.get("/",function(req,res,next){
    if(!req.isAuthenticated())
        res.send(401,"You shall not pass")
    Users.findById(req.user._id,{password: false, _id: false, __v: false,salt:false},(err,usr)=> {
        if(err || !usr)
            res.send(404,"Could not fetch user")
        res.send(200,usr.toObject())
    });
});

module.exports = router;
