var express = require('express');
var router = express.Router();
const passport = require("passport");

router.post("/login",function(req,res,next){
    req.logout();
    passport.authenticate("Auth",(err,user)=> {
        if (err != null || user === false) {
            res.send(401,"Inavalid username / Password");
            return;
        }
        req.logIn(user, function (err) {
            if (err) {
                res.send(401,"Login failed");
            } else {
                // console.log(req.user);
                res.send(200,"Succesful login");
            }
        });
    })(req, res,next);
});

router.get("/logout", function (req, res) {
    req.logout();
    res.send(200);
});

module.exports = router;
