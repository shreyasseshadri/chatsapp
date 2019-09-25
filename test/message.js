var ws_server = 'wss://ex-chatsapp.herokuapp.com/'
var server = 'https://ex-chatsapp.herokuapp.com/'
// server = 'http://localhost:3000/'
// ws_server = 'ws://localhost:3000/'
var username;


fetch(server+'self',{
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    credentials: 'include'
}).then(resp => {return resp.json()})
.then(json => {
    document.getElementById('placeholder').innerText += ' '+json.username;
    username = json.username;
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
            from: username,
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
