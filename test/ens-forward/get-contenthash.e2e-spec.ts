import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, offchainProfile, onchainProfile } from './helpers';

describe('GET /ens/v2/contenthash/:name', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // --- onchain ---

  it('resolves onchain contenthash', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/contenthash/${onchainProfile.name}?noCache=true`)
      .expect(200);

    expect(res.body).toEqual(onchainProfile.contenthash);
  });

  // --- offchain ---

  it('resolves offchain contenthash', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/contenthash/${offchainProfile.name}?noCache=true`)
      .expect(200);

    expect(res.body).toEqual(offchainProfile.contenthash);
  });

  // --- edge cases ---

  it('returns exists:false for a name with no contenthash', async () => {
    // vitalik.eth has no contenthash set
    const res = await request(app.getHttpServer())
      .get('/ens/v2/contenthash/vitalik.eth?noCache=true')
      .expect(200);

    expect(res.body).toEqual({ exists: false });
  });

  it('returns 400 when name is too short', async () => {
    await request(app.getHttpServer())
      .get('/ens/v2/contenthash/a.b')
      .expect(400);
  });
});
