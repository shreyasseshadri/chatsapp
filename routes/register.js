var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const crypto = require('crypto');

const hashPassword = function(password) {
  salt = crypto.randomBytes(16).toString('hex');
  return {hash: crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex'),salt};
};

router.post('/', function(req, res) {
  // res.send('respond with a resource');.
  // console.log(req.body);
  const { body } = req;
  if(!body.username || !body.password || !body.name || !body.phone)
  {
    res.json({success:false,error:"Invalid Body"});
    return;
  }
  let enc =  hashPassword(body.password);
  body.password = enc.hash;
  body.salt = salt;
  let new_user = User(body);
  new_user.save((err)=> {
    if (err) {
      res.json({success: false, error: " Ah shit here we go agin"});
      return;
    }
    res.json({success: true});
  });
});

module.exports = router;
