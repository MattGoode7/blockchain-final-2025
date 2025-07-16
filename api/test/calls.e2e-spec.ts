import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from './setup-e2e';
import { HDNodeWallet, ethers } from 'ethers';
import { OK } from '../src/utils/messages';
import { randomBytes } from 'crypto';

describe('Calls (e2e)', () => {
  let app;
  let server;
  let contractAddress: string;
  let wallet: HDNodeWallet;

  const randomHash = () => '0x' + randomBytes(32).toString('hex');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await setupApp(app);
    server = app.getHttpServer();

    // obtener address
    const res = await request(server).get('/contract-address').expect(200);
    contractAddress = res.body.address;

    // registrar wallet
    wallet = ethers.Wallet.createRandom();
    const msgHex = contractAddress.toLowerCase().replace(/^0x/, '');
    const sig = await wallet.signMessage(ethers.getBytes('0x' + msgHex));
    await request(server).post('/register').send({ address: wallet.address, signature: sig }).expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  it('create call and fetch info', async () => {
    const callId = randomHash();
    const closingTime = new Date(Date.now() + 3600 * 24 * 1000).toISOString();

    // sign call creation
    const messageBytes = contractAddress.slice(2) + callId.slice(2);
    const sig = await wallet.signMessage(ethers.getBytes('0x' + messageBytes));

    const createRes = await request(server)
      .post('/create')
      .send({ callId, signature: sig, closingTime })
      .expect(201);

    expect(createRes.body.message).toBe(OK);

    const getRes = await request(server).get(`/calls/${callId}`).expect(200);
    expect(getRes.body.creator.toLowerCase()).toBe(wallet.address.toLowerCase());

    const closingRes = await request(server).get(`/closing-time/${callId}`).expect(200);
    expect(closingRes.body.callId.toLowerCase()).toBe(callId.toLowerCase());
  });
}); 