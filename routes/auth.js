var express = require('express');
var router = express.Router();
const passport = require("passport");

router.post("/login",function(req,res,next){
     console.log(req.body);
    if(!req.body.username || !req.body.password)
    {
        res.status(400).send("Invalid request");
        return;
    }
    req.logout();
    passport.authenticate("Auth",(err,user)=> {
        if (err != null || user === false) {
            res.status(401).send("Inavalid username / Password");
            return;
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log("Auth error ",err);
                res.status(401).send("Login failed");
                return;
            } else {
                console.log("Sucessful login User" + req.user.username);
                res.redirect('/message');
                return;
            }
        });
    },)(req, res,next);
});

router.get("/logout", function (req, res) {
    req.logout();
    res.send(200);
});

module.exports = router;
