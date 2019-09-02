var express = require('express');
var router = express.Router();
const passport = require("passport");

router.post("/login",function(req,res,next){
    req.logout();
    passport.authenticate("Auth",(err,user)=> {
        if (err != null || user === false) {
            res.json({success: false, error: "invalid username/password"});
            return;
        }
        req.logIn(user, function (err) {
            if (err) {
                res.json({success: false, error: "login error"});
            } else {
                // console.log(req.user);
                res.json({success: true,message: "Succesful login"});
            }
        });
    })(req, res,next);

    
});

router.get("/logout", function (req, res) {
    req.logout();
    res.json({success: true});
});

module.exports = router;
