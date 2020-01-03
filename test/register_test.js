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

    it('Checking phone number length not less than 10', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });
    it('Checking phone number length not more than 10', async () => {
        const register_res = await agent.post('/register').send({phone: '65748890721', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking username isn\'t whitespace', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'     ',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });
    it('Checking username has no spl chars', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'st$@layer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking password length more than 7', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });
    it('Checking password length less than 17', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd12345678!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });
    it('Checking password has spl chars', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd1', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });
    it('Checking password has numbers', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsWord!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking name isn\'t whitespace', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd!', name:" "});
        expect(register_res).to.have.status(400); 
    });
    it('Checking name doesn\'t have spl chars', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd!', name:"Gleep Gl0$b"});
        expect(register_res).to.have.status(400); 
    });
    it('Checking name doesn\'t have spl chars', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd!', name:"Gleep Gl0$b"});
        expect(register_res).to.have.status(400); 
    });
});