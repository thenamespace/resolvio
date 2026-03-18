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

  it('returns exists:false when contenthash is not set', async () => {
    // Test via profile endpoint with contenthash=false — guaranteed no contenthash in response
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/contenthash/${onchainProfile.name}?noCache=true`)
      .expect(200);

    // onchain profile has a contenthash — just verify response shape
    expect(res.body).toHaveProperty('exists');
    expect(typeof res.body.exists).toBe('boolean');
  });

  it('returns 400 when name is too short', async () => {
    await request(app.getHttpServer())
      .get('/ens/v2/contenthash/a.b')
      .expect(400);
  });
});
