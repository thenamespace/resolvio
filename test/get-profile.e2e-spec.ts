import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, offchainProfile, onchainProfile } from './helpers';

describe('GET /ens/v2/profile/:name', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // --- onchain — default params ---

  it('resolves onchain profile with default params', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/profile/${onchainProfile.name}?noCache=true`)
      .expect(200);

    expect(res.body.name).toBe(onchainProfile.name);
    expect(res.body.texts).toContainEqual(onchainProfile.getText('avatar'));
    expect(res.body.texts).toContainEqual(onchainProfile.getText('email'));
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(onchainProfile.getAddress('eth')),
    );
    expect(res.body.contenthash).toEqual(onchainProfile.contenthash); // contenthash fetched by default
  });

  // --- onchain — explicit params ---

  it('resolves onchain profile with explicit texts', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/profile/${onchainProfile.name}?texts=avatar,email&noCache=true`,
      )
      .expect(200);

    expect(res.body.texts).toContainEqual(onchainProfile.getText('avatar'));
    expect(res.body.texts).toContainEqual(onchainProfile.getText('email'));
    expect(res.body.texts).toHaveLength(2);
  });

  it('resolves onchain profile with addresses by chain name', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/profile/${onchainProfile.name}?addresses=eth,btc&noCache=true`,
      ) // comma-separated
      .expect(200);

    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(onchainProfile.getAddress('eth')),
    );
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(onchainProfile.getAddress('btc')),
    );
    expect(res.body.addresses).toHaveLength(2);
  });

  it('resolves onchain profile with addresses by coin type', async () => {
    const eth = onchainProfile.getAddress('eth')!;
    const btc = onchainProfile.getAddress('btc')!;

    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/profile/${onchainProfile.name}?addresses=${eth.coin}&addresses=${btc.coin}&noCache=true`,
      )
      .expect(200);

    expect(res.body.addresses).toContainEqual(expect.objectContaining(eth));
    expect(res.body.addresses).toContainEqual(expect.objectContaining(btc));
  });

  it('resolves onchain profile without contenthash when contenthash=false', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/profile/${onchainProfile.name}?contenthash=false&noCache=true`,
      )
      .expect(200);

    expect(res.body.contenthash).toEqual({ exists: false });
  });

  it('resolves onchain full profile — all chains', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/profile/${onchainProfile.name}?addresses=eth,btc,op,base,matic,celo&noCache=true`,
      ) // comma-separated
      .expect(200);

    for (const addr of onchainProfile.addresses) {
      expect(res.body.addresses).toContainEqual(expect.objectContaining(addr));
    }
  });

  // --- offchain ---

  it('resolves offchain profile with default params', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/profile/${offchainProfile.name}?noCache=true`)
      .expect(200);

    expect(res.body.name).toBe(offchainProfile.name);
    expect(res.body.texts).toContainEqual(offchainProfile.getText('avatar'));
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(offchainProfile.getAddress('eth')),
    );
    expect(res.body.contenthash).toEqual(offchainProfile.contenthash);
  });

  it('resolves offchain profile with explicit params', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/profile/${offchainProfile.name}?texts=avatar,email&addresses=eth,btc&noCache=true`,
      ) // comma-separated
      .expect(200);

    expect(res.body.texts).toContainEqual(offchainProfile.getText('avatar'));
    expect(res.body.texts).toContainEqual(offchainProfile.getText('email'));
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining(offchainProfile.getAddress('eth')),
    );
    // btc is not set in the offchain resolver
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining({ chain: 'btc', exists: false }),
    );
  });

  // --- validation ---

  it('returns 400 for unsupported chain in addresses param', async () => {
    await request(app.getHttpServer())
      .get(`/ens/v2/profile/${onchainProfile.name}?addresses=notachain`)
      .expect(400);
  });

  it('returns 400 when name is too short', async () => {
    await request(app.getHttpServer()).get('/ens/v2/profile/a.b').expect(400);
  });
});
