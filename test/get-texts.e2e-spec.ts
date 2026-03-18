import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, offchainProfile, onchainProfile } from './helpers';

describe('GET /ens/v2/texts/:name', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // --- onchain ---

  it('resolves onchain avatar and email', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/texts/${onchainProfile.name}?keys=avatar&keys=email&noCache=true`,
      )
      .expect(200);

    expect(res.body.texts).toContainEqual(onchainProfile.getText('avatar'));
    expect(res.body.texts).toContainEqual(onchainProfile.getText('email'));
  });

  it('resolves onchain texts for all default keys', async () => {
    const keys = onchainProfile.texts.map((t) => t.key);
    const query = keys.map((k) => `keys=${k}`).join('&');

    const res = await request(app.getHttpServer())
      .get(`/ens/v2/texts/${onchainProfile.name}?${query}&noCache=true`)
      .expect(200);

    for (const expected of onchainProfile.texts) {
      expect(res.body.texts).toContainEqual(expect.objectContaining(expected));
    }
  });

  it('returns exists:false for a key with no record', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/texts/${onchainProfile.name}?keys=com.twitter&noCache=true`)
      .expect(200);

    expect(res.body.texts[0]).toEqual(onchainProfile.getText('com.twitter'));
  });

  it('accepts comma-separated keys', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/texts/${onchainProfile.name}?keys=avatar,email&noCache=true`,
      )
      .expect(200);

    expect(res.body.texts).toContainEqual(onchainProfile.getText('avatar'));
    expect(res.body.texts).toContainEqual(onchainProfile.getText('email'));
  });

  // --- offchain ---

  it('resolves offchain avatar and email', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/texts/${offchainProfile.name}?keys=avatar&keys=email&noCache=true`,
      )
      .expect(200);

    expect(res.body.texts).toContainEqual(offchainProfile.getText('avatar'));
    expect(res.body.texts).toContainEqual(offchainProfile.getText('email'));
  });

  it('resolves offchain texts for all default keys', async () => {
    const keys = offchainProfile.texts.map((t) => t.key);
    const query = keys.map((k) => `keys=${k}`).join('&');

    const res = await request(app.getHttpServer())
      .get(`/ens/v2/texts/${offchainProfile.name}?${query}&noCache=true`)
      .expect(200);

    for (const expected of offchainProfile.texts) {
      expect(res.body.texts).toContainEqual(expect.objectContaining(expected));
    }
  });

  // --- validation ---

  it('returns 400 when name is too short', async () => {
    await request(app.getHttpServer()).get('/ens/v2/texts/a.b').expect(400);
  });
});
