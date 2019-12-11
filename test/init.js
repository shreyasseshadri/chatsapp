process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app').httpServer;
let expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);
describe('Initial tests',  () => {
    
    after(() => {
        agent.close();
    })

    it('responds to /', async () => {
        const res = await agent.get('/');
        expect(res).to.have.status(200);
    });

    it('404 everything else', async () => {
        const res = await agent.get('/random');
        expect(res).to.have.status(404);
    });
    
    // it('Direct message access without logging', async () => {
    //    const res = await agent.get('/message');
    //    expect(res).to.have.status(401);
    // })

    // it('Direct message access after logging', async () => {
    //     const login_res = await agent.post('/auth/login').send({username:'test1',password:'pass1'});
    //     expect(login_res).to.have.status(200);

    //     //Go to message now

    //     const message_res = await agent.get('/message');
    //     expect(message_res).to.have.status(200);
      
    // })

});