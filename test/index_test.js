process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
const url = require('url');

let expect = chai.expect;
const User = require("../models/user");

chai.use(chaiHttp);

const inauth_user = {
    username: "dummydumdum",
    name: "dummy",
    password: "DummyUser@1",
    phone:"5730586835"
}

const dummy_user = {
    username: "dummy",
    name: "dummy",
    password: "DummyUser@1",
    phone:"5730586835"
}

var agent;
let server;
let app;
describe('Index routes',  () => {
    before(async () => {
        server = require('../app').httpServer;
        app = require('../bin/www')
        // server.listen(3000)
        agent = chai.request.agent(server)
        const login_res = await agent.post('/auth/login').send({username:inauth_user.username,password:inauth_user.password});
        
    })

    after(async () => {
        agent.close();
        await User.find({'username':inauth_user.username}).remove()
        await User.find({'username':dummy_user.username}).remove()
    })

    it('un authenticated user is redirected to /', async() =>{
        const resp = await agent.get('/message');
        expect(resp.redirects).to.be.an('array')
        expect(resp.redirects).to.have.length(1)
        expect(url.parse(resp.redirects[0]).pathname).to.equal("/")
    });

});