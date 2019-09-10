let ws;
var username; 
var password;
let time = 1;
var server = 'https://ex-chatsapp.herokuapp.com/'
var ws_server = 'wss://ex-chatsapp.herokuapp.com/'
server = 'http://localhost:3000/'
ws_server = 'ws://localhost:3000/'
function action(type,args){
    username =  document.getElementById('username').value
    password  = document.getElementById('password').value 
    if(!type)
    {
        fetch(server+'auth/login',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password        
            })
        }).then(resp => {return ""})
        .then(json => {
            console.log(json);
            fetch(server+'self',{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }).then(resp => {return ""})
            .then(json => {console.log(json)});

            console.log('here')
            ws = new WebSocket(ws_server+'message');
            console.log("hello"+ws);
            // ws.send('hello');
            ws.onerror = (err) => {
                console.log(err);
            }
            ws.onmessage = (message) => {
                console.log(message.data);
            };
            
        });
    }
    else if(type === "close")
    {   
        console.log('herer', ws);
        if(ws)ws.close();
    }
    else if(type === "msg")
    {   
        let msg = document.getElementById('msg').value;
        // console.log(msg);
        let toUser = document.getElementById('to').value;
        time++;
        if(ws){
            ws.send(JSON.stringify({
                from: username,
                to: toUser,
                type: "text",
                text: msg,
                timestamp: Date.now()
            }));
        }
    }
}

// function close()
// {   
//     console.log("here");
//     if(ws){
//         console.log("closing");
//         ws.close();
//     }
// }
