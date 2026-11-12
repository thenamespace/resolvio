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
    // btc is not set in the offchain resolver
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining({ chain: 'btc', coin: COIN_BTC, exists: false }),
    );
  });

  // --- vara (coin type 913, SS58 prefix 137) ---

  it('resolves a vara address by chain name and coin type', async () => {
    const vara = {
      coin: 913,
      chain: 'vara',
      value: 'kGkP3DQEEppWt6nSBjXKrknptM4TEcG5ADGjYqUxE8rg8dvDF',
      exists: true,
    };

    for (const query of ['chains=vara', 'coins=913']) {
      const res = await request(app.getHttpServer())
        .get(`/ens/v2/addresses/happy.polybaskets.eth?${query}&noCache=true`)
        .expect(200);

      expect(res.body.addresses).toContainEqual(vara);
    }
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

  it('returns 400 for unsupported coin type', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/addresses/${onchainProfile.name}?coins=999999`)
      .expect(400);

    expect(res.body).toMatchObject({
      message: 'Unsupported coin type: 999999',
    });
  });

  it('returns 400 when name is too short', async () => {
    await request(app.getHttpServer()).get('/ens/v2/addresses/a.b').expect(400);
  });
});
