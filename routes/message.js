var express = require('express');
var router = express.Router();
const Message = require('../models/message');
const Users = require('../models/user');
var path  = require('path');

async function userExists(userPhone){
    const count= await Users.count({phone:userPhone})
    if(count>0)return true
    else return false
}

var clients = {};
var undeliveredMessages = {};

const TEXT_COMMUNICATION = "text";
const READ_RECEIPT = "read_receipt";


async function getHistory(from,to){
    return Message.find({'to':to,'from':from},{_id:0,from:1,to:1,text:1,timestamp:1});
}

async function getMessagesFromId(ids){
    return Message.find({'_id':ids},{_id:0,from:1,to:1,text:1,timestamp:1});
}

router.ws("/",function(ws,req){
    if(!req.isAuthenticated()){
        console.log('Unauthorized connection')
        ws.terminate();
        return;
    
    }
    console.log('Secure Connection established');
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


    ws.on("message",async (msg)=> {
        console.log('Message from client ',msg)
        msg = JSON.parse(msg);
        const toExists = await userExists(msg.to)
        const fromExists  = await userExists(msg.from)
        if(!msg.to || !msg.from || !msg.timestamp ||!msg.type || 
            !toExists || !fromExists)
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
                    break
                }
                case READ_RECEIPT:
                {    
                    let msg_id;
                    
                    if(clients[msg.to]){   
                        console.log(Date.now());
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
                            console.log(" Read receipt sent from "+msg.from+" at time "+msg.timestamp);
                            console.log(" Undelivered "+JSON.stringify(undeliveredMessages));
                        }
    
                    });
                    break
                }
                default :
                {
                    console.log(msg)
                }
            }
        }
    });

    ws.on("close", function (ws, event) {
        if (clients[ws.user.phone] != null) {
            delete clients[ws.user.phone];
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
