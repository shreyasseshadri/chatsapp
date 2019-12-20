var server = "http://"+location.host+"/";
var ws_server;
if(location.hostname === "localhost")
    ws_server = "ws://"+location.host+"/";
else ws_server = "wss://"+location.host+"/";

var phone;
fetch(server+'self',{
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    credentials: 'include'
}).then(resp => {return resp.json()})
.then(json => {
    document.getElementById('placeholder').innerText += ' '+json.phone;
    username = json.phone;
});

const ws = new WebSocket(ws_server+'message');
ws.onerror = (err) => {
    console.log(err);
}
ws.onmessage = (message) => {
    console.log(message.data);
};
let buffer = [];
function message(){
    let msg = document.getElementById('msg').value;
    let toUser = document.getElementById('to').value;
    let resp = JSON.stringify({
            from: phone,
            to: toUser,
            type: "text",
            text: msg,
            timestamp: Date.now()
        });
    if(ws){
        buffer.map((msg)=> {
            ws.send(msg);
        })
        buffer.length = 0;
        ws.send(resp);
    }
    else{
        console.log("ws not available");
        buffer.push(resp);
    }
}

function history(){
    let otherUser  = document.getElementById('history').value;
    fetch(server+'message/history'+'?otherUser='+otherUser,{
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).then((resp) => {return resp.json()})
    .then((json) => {
        console.log(json);
    })
}