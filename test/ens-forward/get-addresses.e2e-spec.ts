import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  COIN_BASE,
  COIN_BTC,
  COIN_CELO,
  COIN_ETH,
  COIN_MATIC,
  COIN_OP,
  createTestApp,
  offchainProfile,
  onchainProfile,
} from './helpers';

describe('GET /ens/v2/addresses/:name', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // --- onchain ---

  it('resolves onchain eth address', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/addresses/${onchainProfile.name}?chains=eth&noCache=true`)
      .expect(200);

    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(onchainProfile.getAddress('eth')),
    );
  });

  it('resolves onchain btc address', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/addresses/${onchainProfile.name}?chains=btc&noCache=true`)
      .expect(200);

    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(onchainProfile.getAddress('btc')),
    );
  });

  it('resolves onchain addresses for multiple chains by chain name', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/addresses/${onchainProfile.name}?chains=eth,btc,op,base,matic,celo&noCache=true`,
      )
      .expect(200);

    for (const addr of onchainProfile.addresses) {
      expect(res.body.addresses).toContainEqual(expect.objectContaining(addr));
    }
  });

  it('resolves onchain addresses for multiple chains by coin type', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/addresses/${onchainProfile.name}` +
          `?coins=${COIN_ETH}&coins=${COIN_BTC}&coins=${COIN_OP}` +
          `&coins=${COIN_BASE}&coins=${COIN_MATIC}&coins=${COIN_CELO}&noCache=true`,
      )
      .expect(200);

    for (const addr of onchainProfile.addresses) {
      expect(res.body.addresses).toContainEqual(expect.objectContaining(addr));
    }
  });

  // --- offchain ---

  it('resolves offchain eth address', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/addresses/${offchainProfile.name}?chains=eth&noCache=true`)
      .expect(200);

    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(offchainProfile.getAddress('eth')),
    );
  });

  it('resolves offchain addresses for multiple chains', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/addresses/${offchainProfile.name}?chains=eth,btc&noCache=true`,
      )
      .expect(200);

    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(offchainProfile.getAddress('eth')),
    );
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(offchainProfile.getAddress('btc')),
    );
  });

  // --- parameter behaviour ---

  it('returns exists:false for a coin with no record', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/addresses/${onchainProfile.name}?coins=501&noCache=true`)
      .expect(200);

    expect(res.body.addresses[0]).toMatchObject({ coin: 501, exists: false });
  });

  it('returns 400 for unsupported chain name', async () => {
    await request(app.getHttpServer())
      .get(`/ens/v2/addresses/${onchainProfile.name}?chains=notachain`)
      .expect(400);
  });

  it('returns 400 when name is too short', async () => {
    await request(app.getHttpServer()).get('/ens/v2/addresses/a.b').expect(400);
  });
});
