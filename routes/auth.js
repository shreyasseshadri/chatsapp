var express = require('express');
var router = express.Router();
const passport = require("passport");

router.post("/login",function(req,res,next){
    console.log(req.body);
    if(!req.body.username || !req.body.password)
    {
        res.send(400,"Invalid request");
        return;
    }
    req.logout();
    passport.authenticate("Auth",(err,user)=> {
        if (err != null || user === false) {
            res.send(401,"Inavalid username / Password");
            return;
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log("ERRRRRRRRRRRRRRRRRRRR",err);
                res.send(401,"Login failed");
                return;
            } else {
                console.log(req.user);
                res.send(200,"Succesful login");
                return;
            }
        });
    })(req, res,next);
});

router.get("/logout", function (req, res) {
    req.logout();
    res.send(200);
});

module.exports = router;
