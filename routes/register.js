var express = require('express');
var router = express.Router();
const User = require("../models/user");
const crypto = require('crypto');

const hashPassword = function(password) {
  var salt = crypto.randomBytes(16).toString('hex');
  return {hash: crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex'),salt};
};

router.post('/', function(req, res) {
  const { body } = req;
  if(!body.username || !body.password || !body.name || !body.phone)
  {
    res.send(400,"Invalid Body");
    return;
  }
  if(body.phone.toString.length()!=10){
    res.send(400,"Phone number not valid");
  }
  let enc =  hashPassword(body.password);
  body.password = enc.hash;
  body.salt = enc.salt;
  let new_user = User(body);
  new_user.save((err)=> {
    if (err) {
      console.log(err);
      res.status(400).send(" Ah shit here we go agin");
      return;
    }
    Object.assign(body,{password:undefined,hash:undefined,salt:undefined});
    res.json(200,body);
  });
});

module.exports = router;
