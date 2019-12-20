process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
const url = require('url');

let expect = chai.expect;
const User = require("../models/user");

chai.use(chaiHttp);

const dummy_user = {
    username: "dummy",
    name: "dummy",
    password: "DummyUser@1",
    phone:"5730586835"
}

var agent;
let server;
let app;
describe('Initial tests',  () => {
    before(async () => {
        server = require('../app').httpServer;
        app = require('../bin/www')
        server.listen(3000)
        agent = chai.request.agent(server)
        const resp = await agent.post('/register').send(dummy_user);
        // console.log(resp)
        expect(resp).to.have.status(200)
    })

    after(async () => {
        agent.close();
        await User.find({'username':dummy_user.username}).remove()
    })

    it('responds to /', async () => {
        const res = await agent.get('/');
        expect(res).to.have.status(200);
    });

    it('404 everything else', async () => {
        const res = await agent.get('/random');
        expect(res).to.have.status(404);
    });
    
    it('Direct message access without logging redirects back to login', async () => {
       const res = await agent.get('/message');
       expect(res.redirects).to.be.an('array')
       expect(res.redirects).to.have.length(1)
       expect(url.parse(res.redirects[0]).pathname).to.equal("/")
    })

    it('Direct message access after logging', async () => {
        const login_res = await agent.post('/auth/login').send({username:dummy_user.username,password:dummy_user.password});
        expect(login_res).to.have.status(200);

        //Go to message now

        const message_res = await agent.get('/message');
        expect(message_res).to.have.status(200);
      
    })

});