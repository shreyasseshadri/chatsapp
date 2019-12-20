var express = require('express');
var router = express.Router();
const Message = require('../models/message');
const Users = require('../models/user');
var path  = require('path');


const users = [];

Users.find({},{phone:1},(err,res)=> {
    res.map((usr) => {users.push(usr.phone);});
});

var clients = {};
var undeliveredMessages = {};

const TEXT_COMMUNICATION = "text";


async function getHistory(from,to){
    return Message.find({'to':to,'from':from},{_id:0,from:1,to:1,text:1,timestamp:1});
}

async function getMessagesFromId(ids){
    return Message.find({'_id':ids},{_id:0,from:1,to:1,text:1,timestamp:1});
}

router.ws("/",function(ws,req){

    console.log('Connection eshtablished');
    if(!req.isAuthenticated()){
        ws.terminate();
        return;
    
    }
    ws.user = req.user;
    clients[req.user.phone] = ws;


    if(undeliveredMessages[ws.user.phone]){
        getMessagesFromId(undeliveredMessages[ws.user.phone]).then((msgs) => {

            if(clients[ws.user.phone]){
                clients[ws.user.phone].send(JSON.stringify(msgs));
                delete undeliveredMessages[ws.user.phone];
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
                    let msg_id;
                    
                    if(!msg.text){
                        ws.send('Invalid body');
                        break;
                    }
                    if(clients[msg.to])
                    {
                        clients[msg.to].send(JSON.stringify(msg));
                    }
                    Message(msg).save((err,msg)=> {
                        if(!clients[msg.to]){
                            if(undeliveredMessages[msg.to])
                                undeliveredMessages[msg.to].push(msg._id);
                            else{
                                undeliveredMessages[msg.to] = [];
                                undeliveredMessages[msg.to].push(msg._id);
                            }
                            console.log(" Undelivered "+JSON.stringify(undeliveredMessages));
                        }
    
                    });
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

router.get("/history",function(req,res,next){
    if(!req.isAuthenticated()){
        res.status(401).send("You shall not pass");
        return;
    }
    let otherUser = req.query.otherUser;
    let me = req.user.username;

    getHistory([otherUser,me],[otherUser,me]).then((msgs)=> {
        msgs.sort((a,b) => {return a.timestamp - b.timestamp});
        res.send(JSON.stringify(msgs));
    });
});

module.exports = router;
