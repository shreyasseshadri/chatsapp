process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
//To connect with http
let server = require('../app').httpServer;
let expect = chai.expect;

chai.use(chaiHttp);

var agent;
describe('Register tests',  () => {
    before(async () => {
        server = require('../app').httpServer;
        server.listen(3000)
        agent = chai.request.agent(server);
    })

    after(() => {
        agent.close();
    })

    it('Checking phone number length', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

});