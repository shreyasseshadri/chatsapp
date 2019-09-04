var express = require('express');
var router = express.Router();
const Users = require("../models/user");

router.get("/",function(req,res,next){
    console.log("C'mon"+req.user)
    if(!req.isAuthenticated())
    {
        res.send(401,"You shall not pass");
        return;
    }
    Users.findById(req.user._id,{password: false, _id: false, __v: false,salt:false},(err,usr)=> {
        if(err || !usr)
        {
            res.send(404,"Could not fetch user");
            return;
        }
        res.send(200,usr.toObject())
        return;
    });
});

module.exports = router;
