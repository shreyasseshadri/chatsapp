var express = require('express');
var router = express.Router();
const Message = require('../models/message');
const Users = require('../models/user');
var path  = require('path');
var test = path.resolve(__dirname,'../test');

const users = [];

Users.find({},{username:1},(err,res)=> {
    res.map((usr) => {users.push(usr.username);});
});

var clients = {};
var undeliveredMessages = {};

const TEXT_COMMUNICATION = "text";
const UNDELIVELIRED = "undelivered";

async function getMessagesFromTime(stamps){
    let message = Message.find({timestamp:stamps},{_id:0,from:1,to:1,text:1,timestamp:1})
    return message;
}

router.ws("/",function(ws,req){

    console.log('Connection eshtablished');
    if(!req.isAuthenticated()){
        ws.terminate();
        return;
    
    }
    ws.user = req.user;
    clients[req.user.username] = ws;

    if(undeliveredMessages[ws.user.username]){
        getMessagesFromTime(undeliveredMessages[ws.user.username]).then((msgs) => {

            if(clients[ws.user.username]){
                clients[ws.user.username].send(JSON.stringify(msgs));
                delete undeliveredMessages[ws.user.username];
                console.log("After Delivered "+ JSON.stringify(undeliveredMessages));
            }
        });
    }
    ws.send('hello from server');
    console.log('Clients: '+Object.keys(clients));
    ws.on("message",(msg)=> {
        msg = JSON.parse(msg);
        console.log(msg);
        if(!msg.to || !msg.from || !msg.timestamp ||!msg.type || 
            !users.includes(msg.from) || !users.includes(msg.to))
        {
            ws.send("Invalid body");
        }
        else
        {
            switch(msg.type)
            {
                case TEXT_COMMUNICATION:
                {    
                    delete msg.type
                    if(!msg.text){
                        ws.send('Invalid body');
                        break;
                    }
                    if(clients[msg.to]){
                        clients[msg.to].send(JSON.stringify(msg));
                    }
                    else{
                        //TODO: Use id instead of timstamp
                        if(undeliveredMessages[msg.to])
                            undeliveredMessages[msg.to].push(msg.timestamp);
                        else{
                            undeliveredMessages[msg.to] = [];
                            undeliveredMessages[msg.to].push(msg.timestamp);
                        }
                        console.log(" Undelivered "+JSON.stringify(undeliveredMessages));
                    }
                    Message(msg).save();
                }
                default :
                {
                    console.log(msg)
                }
            }
        }
    });

    ws.on("close", function (ws, event) {
        if (clients[ws.user.username] != null) {
            delete clients[ws.user.username];
        }
        console.log('After deleting: ',Object.keys(clients));
    }.bind(null, ws));

});

module.exports = router;
