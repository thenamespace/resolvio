import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers';

const ARTII_ADDRESS = '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8';
const THECAP_ADDRESS = '0x035eBd096AFa6b98372494C7f08f3402324117D3';
const NO_RECORD_ADDRESS = '0x395c9842B8a348BCc0a723f00bc4AD8db9a4932A';

describe('GET /ens/v2/reverse', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // --- single ---

  it('resolves artii.eth address', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${ARTII_ADDRESS}?noCache=true`)
      .expect(200);

    expect(res.body).toMatchObject({
      address: ARTII_ADDRESS,
      name: 'artii.eth',
      hasReverseRecord: true,
    });
  });

  it('resolves thecap.eth address', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${THECAP_ADDRESS}?noCache=true`)
      .expect(200);

    expect(res.body).toMatchObject({
      address: THECAP_ADDRESS,
      name: 'thecap.eth',
      hasReverseRecord: true,
    });
  });

  it('returns hasReverseRecord:false for address with no reverse record', async () => {
    const res = await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${NO_RECORD_ADDRESS}?noCache=true`)
      .expect(200);

    expect(res.body).toMatchObject({
      address: NO_RECORD_ADDRESS,
      hasReverseRecord: false,
    });
    expect(res.body.name).toBeUndefined();
  });

  it('returns 400 for an invalid address', async () => {
    await request(app.getHttpServer())
      .get('/ens/v2/reverse/notanaddress')
      .expect(400);
  });

  // --- bulk ---

  it('bulk resolves multiple addresses', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/ens/v2/reverse/bulk?addresses=${ARTII_ADDRESS},${THECAP_ADDRESS},${NO_RECORD_ADDRESS}&noCache=true`,
      )
      .expect(200);

    expect(res.body.addresses).toHaveLength(3);

    expect(res.body.addresses).toContainEqual(
      expect.objectContaining({ address: ARTII_ADDRESS.toLowerCase(), name: 'artii.eth', hasReverseRecord: true }),
    );
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining({ address: THECAP_ADDRESS.toLowerCase(), name: 'thecap.eth', hasReverseRecord: true }),
    );
    expect(res.body.addresses).toContainEqual(
      expect.objectContaining({ address: NO_RECORD_ADDRESS.toLowerCase(), hasReverseRecord: false }),
    );
  });

  it('returns 400 when no addresses provided', async () => {
    await request(app.getHttpServer())
      .get('/ens/v2/reverse/bulk')
      .expect(400);
  });
});
