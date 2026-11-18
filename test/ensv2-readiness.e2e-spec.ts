import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers';

/**
 * ENSv2 readiness checks, see https://docs.ens.domains/web/ensv2-readiness/
 * A failure here means the ENS library in use is outdated.
 */
describe('ENSv2 readiness', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves ur.integration-tests.eth through the new Universal Resolver', async () => {
    const res = await request(app.getHttpServer())
      .get('/ens/v2/addresses/ur.integration-tests.eth?chains=eth&noCache=true')
      .expect(200);

    // 0x1111... means the library still uses the legacy Universal Resolver
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining({
        chain: 'eth',
        coin: 60,
        exists: true,
        value: '0x2222222222222222222222222222222222222222',
      }),
    );
  });
});
