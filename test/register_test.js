process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
//To connect with http
let server = require('../app').httpServer;
let expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);
describe('Initial tests',  () => {
    
    after(() => {
        agent.close();
    })

    it('Checking phone number length', async () => {
        const register_res = await agent.post('/register').send({phone: '657488907', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking phone number length', async () => {
        const register_res = await agent.post('/register').send({phone: '65748890721', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking phone is a number', async () => {
        const register_res = await agent.post('/register').send({phone: '65748ab076', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking username is without whitespace', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'stl ayer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });
    
    it('Checking username is alphanumeric', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'st!layer',password:'PaSsW0rd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking password length', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'stlayer',password:'Pa', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking password length', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'stlayer',password:'PaSsW0rd!123456789023456', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking password lack of numbers', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'stlayer',password:'PaSsWrd!', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking password lack of spl chars', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'stlayer',password:'PaSsWrds', name:"Gleep glopb"});
        expect(register_res).to.have.status(400); 
    });

    it('Checking name is only letters', async () => {
        const register_res = await agent.post('/register').send({phone: '6574889076', username:'stlayer',password:'PaSsW0rd!', name:"Gleep glo6pb"});
        expect(register_res).to.have.status(400); 
    });
});
