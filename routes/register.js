var express = require('express');
var router = express.Router();
const User = require("../models/user");
const crypto = require('crypto');
var validator = require('validator');

const hashPassword = function(password) {
  var salt = crypto.randomBytes(16).toString('hex');
  return {hash: crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex'),salt};
};

const validRegistration = function(details){
  if(details.phone.length!=10 || isNaN(Number(details.phone))){
    //console.log(details.phone.length!=10)
    //console.log(isNaN(Number(details.phone)))
    return [1,"Phone number not valid"]
  }
  //console.log(!validator.isAlphanumeric(details.username));
  if(!validator.isAlphanumeric(details.username)){
    return [2,"Invalid Username, letters and numbers only."];
  }
  var pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;;
  //console.log(/\S/.test(details.password)); will check just whitespace.
  if(!(details.password.match(pattern))){
    return [3, "Password must have 1 uppercase, 1 lowercase, 1 number, 1 special character, and between 8 and 16 characters."];
  }
  //console.log(!validator.isAlpha(details.name).split(" ").join(""));
  if(!validator.isAlpha(details.name.split(" ").join(""))){
    return [4, "Name is supposed to be alphabets"];
  }
  console.log("All checks passed, valid user");
  return [0, "No errors"];
}

router.post('/', function(req, res) {
  const { body } = req;
  if(!body.username || !body.password || !body.name || !body.phone)
  { console.log("Invalid body");
    res.send(400,"Invalid Body");
    return;
  }
  
  const [errCode, errMsg] = validRegistration(body);
  if(errCode)
    return res.send(400, errMsg);
  
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
