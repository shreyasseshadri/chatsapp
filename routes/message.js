var express = require('express');
var router = express.Router();
const Message = require('../models/message');

var clients = {}

const TEXT_COMMUNICATION = "text";

router.ws("/",function(ws,req){

    console.log('Connection eshtablished');
    if(!req.isAuthenticated())
    {
        ws.terminate();
        return;
    }
    ws.user = req.user;
    ws.id = 123;
    // console.log(ws.user);
    ws.send('hello from server');
    clients[req.user.username] = ws;
    console.log('Clients: '+Object.keys(clients));
    ws.on("message",(msg)=> {
        msg = JSON.parse(msg);
        if(!msg.to || !msg.from || !msg.timestamp ||!msg.type)
        {
            ws.send("Invalid body");
        }
        else
        {
            // console.log(msg);
            switch(msg.type)
            {
                case TEXT_COMMUNICATION:
                {   
                    if(clients[msg.to])
                    {
                        clients[msg.to].send(JSON.stringify(msg));
                    }
                    else
                    {
                        delete clients[msg.to];
                    }
                    delete msg.type
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
