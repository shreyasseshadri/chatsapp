process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
const url = require('url');

let expect = chai.expect;
const User = require("../models/user");

chai.use(chaiHttp);

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

let server;
let agent1;
let agent2;

describe('Auth Test',  () => {
    before(async () => {
        server = require('../app').httpServer;
        server.listen(3000)
        agent1 = chai.request.agent(server);
        agent2 = chai.request.agent(server);

        const resp1 = await agent1.post('/register').send(dummy_user1);
        //console.log(resp1.text)
        expect(resp1).to.have.status(200)
    })

    after(async () => {
        agent1.close();
        agent2.close();

        await User.find({username:dummy_user1.username}).remove()
        await User.find({username:dummy_user2.username}).remove()
    })

    it('Unrecognized users are rejected', async() =>{
        const login_res1 = await agent1.post('/auth/login').send({username:dummy_user1.username,password:dummy_user1.password});
        expect(login_res1).to.have.status(200);
        
        const login_res2 = await agent2.post('/auth/login').send({username:dummy_user2.username,password:dummy_user2.password});
        expect(login_res2).to.have.status(401);
    });
});