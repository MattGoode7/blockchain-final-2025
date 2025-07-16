import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from './setup-e2e';
import { HDNodeWallet, ethers } from 'ethers';
import { OK } from '../src/utils/messages';

describe('Authorization (e2e)', () => {
  let app;
  let server;
  let contractAddress: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await setupApp(app);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /contract-address should return contract address', async () => {
    const res = await request(server).get('/contract-address').expect(200);
    contractAddress = res.body.address;
    expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('unknown address should not be authorized', async () => {
    const unknownAddress = ethers.Wallet.createRandom().address;
    const res = await request(server).get(`/authorized/${unknownAddress}`).expect(200);
    expect(res.body.authorized).toBe(false);
  });

  it('register a new address', async () => {
    const wallet: HDNodeWallet = ethers.Wallet.createRandom();
    const messageHex = contractAddress.toLowerCase().replace(/^0x/, '');
    const signature = await wallet.signMessage(ethers.getBytes('0x' + messageHex));

    const res = await request(server)
      .post('/register')
      .send({ address: wallet.address, signature })
      .expect(200);
    expect(res.body.message).toBe(OK);

    const authRes = await request(server).get(`/authorized/${wallet.address}`).expect(200);
    expect(authRes.body.authorized).toBe(true);
  });
}); 