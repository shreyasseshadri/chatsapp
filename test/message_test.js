process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

const User = require("../models/user");
const WebSocket = require('ws');
chai.use(chaiHttp);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
    A callback is basically some function that you give and you expect it to be executed after a certain event has 
    happened.
    For eg: client.onopen = function () {....}
    In this case the function given as input will be exectud as soon as connection is opened.
    The Problem with this is, mocha does not wait for callbacks. Meaning mocha does not wait till connection is 
    opened. To resolve this issue we are using Promises. Using await we restrict mocha to wait untill the Promise
    is resolved. I have converted callbacks functions into await functions so that i can restrict mocha to wait 
    till the Promise is complete.
*/


// Returns a Promise saying that "I will resolve only after connection is eshtablished"
function await_connect(url,session_cookie) {
    return new Promise((resolve,reject) => {

        var client = new WebSocket(url,
        {
            'headers': {
                'Cookie': 'connect.sid='+session_cookie
            }
        });
        client.onopen = function() {
            resolve(client);
        };
        client.onerror = function(err) {
            reject(err);
        };
    });
}

// Returns a Promise saying that "I will resolve only after I get a message"
function await_listen(ws) {
    return new Promise((resolve,reject) => {
        ws.onmessage = function(msg) {
            resolve(msg)
        }
    });
}

function get_cookie_from_header(header) {

    var cookie;
    header.split('\n').forEach((string)=>{
        if(string.includes('Cookie')){
            cookie = string.split('=')[1].replace('\r','')
        }
    })
    return cookie;
}

let server;
let agent1;
let agent2;

const dummy_user1 = {
    username: "dummy1",
    name: "dummy",
    password: "DummyUser@1",
    phone:"5730586836"
}
const dummy_user2 = {
    username: "dummy2",
    name: "dummy",
    password: "DummyUser@2",
    phone:"5730586837"
}
const dummy_user3 = {
    username: "dummy3",
    name: "dummy",
    password: "DummyUser@3",
    phone:"5730586833"
}

describe('Message Tests',  () => {
    before(async () => {
        server = require('../app').httpServer;
        server.listen(3000)
        agent1 = chai.request.agent(server);
        agent2 = chai.request.agent(server);

        
        const resp1 = await agent1.post('/register').send(dummy_user1);
        console.log(resp1.text)
        expect(resp1).to.have.status(200)
        
        const resp2 = await agent2.post('/register').send(dummy_user2);
        console.log(resp2.text)
        expect(resp2).to.have.status(200)  
        
    })

    after(async () => {
        agent1.close();
        agent2.close();

        await User.find({username:dummy_user1.username}).remove()
        await User.find({username:dummy_user2.username}).remove()
    })

    it('Simple Message exchange', async () => {

        const login_res1 = await agent1.post('/auth/login').send({username:dummy_user1.username,password:dummy_user1.password});
        expect(login_res1).to.have.status(200);
        
        const login_res2 = await agent2.post('/auth/login').send({username:dummy_user2.username,password:dummy_user2.password});
        expect(login_res2).to.have.status(200);


        const session_cookie1 = decodeURIComponent(get_cookie_from_header(login_res1.req._header)) // Session cookies are maintained and will later be used in websockets
        const session_cookie2 = decodeURIComponent(get_cookie_from_header(login_res2.req._header))

        
        const client1 = await await_connect('ws://localhost:3000/message',session_cookie1) // This finishes execution only after the Promise given by await_connect is resolved.
        const client2 = await await_connect('ws://localhost:3000/message',session_cookie2)

        await sleep(2000)
        const msg_sent_by_1 = JSON.stringify({
            from: dummy_user1.phone,
            to: dummy_user2.phone,
            type: "text",
            text: 'Hello test2!',
            timestamp: Date.now(),
        })
        client1.send(msg_sent_by_1)        

        var msg1 = await await_listen(client2) // This finishes execution only after the Promise given by await_listen is resolved.
        expect(msg1.data).to.equal(msg_sent_by_1)

        const msg_sent_by_2 = JSON.stringify({
            from: dummy_user2.phone,
            to: dummy_user1.phone,
            type: "text",
            text: 'Hello back test1!',
            timestamp: Date.now()
        })
        client2.send(msg_sent_by_2)
        var msg2 = await await_listen(client1)

        expect(msg2.data).to.equal(msg_sent_by_2)
    })
});
