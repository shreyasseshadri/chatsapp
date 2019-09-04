var express = require('express');
var router = express.Router();

var clients = {}
router.ws("/",function(ws,req){
    ws.user = req.user
    clients[req.user.username] = ws;
    ws.on("message",(msg)=> {
        msg = JSON.parse(msg)
        if(!msg.to || !msg.from || !msg.stamp)
        {
            ws.send("Invalid body");
        }
        else
        {
            console.log(msg);
        }
    });
    ws.on("close",(ws) => {
        delete lients[ws.user.username];
    })
});

module.exports = router;
