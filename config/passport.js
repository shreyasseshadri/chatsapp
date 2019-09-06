const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const Users = require('../models/user');

const validatePassword = function(password,hash,salt) {
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
    // console.log(hash === genHash); 
    return hash === genHash;
};

module.exports = function(passport){
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        // console.log('Deserialize');
        Users.findById(id,(err,usr)=> {
        // console.log(usr);
        if(err)
        {console.log("error",err);done(err);}
            // done(err);
        if(!usr)
            done(null,false)
        done(null,usr);
        });
    });
    
    passport.use("Auth",
    new LocalStrategy(function (username, password, done) {
        Users.findOne({username: username}, (err, user) => {
            // console.log(user);
            if (err)
                return done(err);
            if (!user || !validatePassword(password, user.password , user.salt))
                return done(null, false);
            return done(null,user);
            });
        })
    );
}