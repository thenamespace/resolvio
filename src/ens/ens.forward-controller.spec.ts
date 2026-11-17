import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppProperties } from 'src/app-properties/app-properties';
import { LoggerService } from 'src/logger/logger.service';
import { EthClients } from 'src/web3/eth.clients';
import { FORWARD_RESOLVER_CACHE } from './caches/forward-resolver.cache';
import { EnsForwardController } from './ens.forward-controller';
import { EnsForwardResolver } from './ens.forward-resolver';

const COIN_ETH = 60;
const COIN_BASE = 2147492101;
const ADDRESS = '0x2B0F09F23193de2Fb66258a10886B9f06903276c';

describe('EnsForwardController (mocked ENS client)', () => {
  let app: INestApplication<App>;
  let getRecords: jest.Mock;

  beforeEach(async () => {
    getRecords = jest.fn().mockResolvedValue({ texts: [], coins: [] });

    const noopLogger = { debug: jest.fn(), log: jest.fn(), warn: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [EnsForwardController],
      providers: [
        EnsForwardResolver,
        { provide: EthClients, useValue: { getEnsClient: () => ({ getRecords }) } },
        { provide: FORWARD_RESOLVER_CACHE, useValue: { isEnabled: () => false, setText: jest.fn(), setAddress: jest.fn() } },
        { provide: LoggerService, useValue: { forContext: () => noopLogger } },
        { provide: AppProperties, useValue: { maxBulkProfileRequest: 20, minCacheRefreshInterval: 5 } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ENSv2 readiness: names must not be assumed to end in `.eth`
  describe('name handling (ENSv2 readiness)', () => {
    it.each([
      ['.eth name', 'vitalik.eth'],
      ['DNS name', 'ensfairy.xyz'],
      ['subdomain of a DNS name', 'ses.fkey.id'],
      ['emoji name', '🦇🔊🦇🔊🦇🔊.eth'],
      ['ENSv2 canary name', 'ur.integration-tests.eth'],
      ['offchain/CCIP-read canary name', 'test.offchaindemo.eth'],
    ])('passes a %s through to the resolver untouched', async (_label, name) => {
      const res = await request(app.getHttpServer())
        .get(`/ens/v2/texts/${encodeURIComponent(name)}?keys=avatar`)
        .expect(200);

      expect(res.body.name).toBe(name);
      expect(getRecords).toHaveBeenCalledWith({ name, texts: ['avatar'] });
    });

    it('lowercases and trims the requested name', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/texts/%20EnsFairy.XYZ%20?keys=avatar')
        .expect(200);

      expect(getRecords).toHaveBeenCalledWith({ name: 'ensfairy.xyz', texts: ['avatar'] });
    });
  });

  describe('address coin types', () => {
    it('defaults to the Ethereum coin type when nothing is requested', async () => {
      await request(app.getHttpServer()).get('/ens/v2/addresses/test.ses.eth').expect(200);

      expect(getRecords).toHaveBeenCalledWith({ name: 'test.ses.eth', coins: [COIN_ETH] });
    });

    it('maps a chain name to its ENSIP-11 coin type', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/addresses/test.ses.eth?chains=base')
        .expect(200);

      expect(getRecords).toHaveBeenCalledWith({ name: 'test.ses.eth', coins: [COIN_BASE] });
    });

    it('returns each requested coin type separately, with its chain name', async () => {
      getRecords.mockResolvedValue({
        texts: [],
        coins: [
          { id: COIN_ETH, name: 'eth', value: ADDRESS },
          { id: COIN_BASE, name: 'base', value: '0x7d3a48269416507E6d207a9449E7800971823Ffa' },
        ],
      });

      const res = await request(app.getHttpServer())
        .get('/ens/v2/addresses/test.ses.eth?coins=60,2147492101')
        .expect(200);

      expect(res.body.addresses).toEqual([
        { coin: COIN_ETH, chain: 'eth', value: ADDRESS, exists: true },
        {
          coin: COIN_BASE,
          chain: 'base',
          value: '0x7d3a48269416507E6d207a9449E7800971823Ffa',
          exists: true,
        },
      ]);
    });

    it('reports exists:false for a coin with no record', async () => {
      const res = await request(app.getHttpServer())
        .get('/ens/v2/addresses/test.ses.eth?chains=base')
        .expect(200);

      expect(res.body.addresses).toEqual([{ coin: COIN_BASE, chain: 'base', exists: false }]);
    });

    it('rejects an unsupported chain without calling the client', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/addresses/test.ses.eth?chains=notachain')
        .expect(400);

      expect(getRecords).not.toHaveBeenCalled();
    });

    it('rejects coins and chains used together', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/addresses/test.ses.eth?coins=60&chains=eth')
        .expect(400);

      expect(getRecords).not.toHaveBeenCalled();
    });
  });

  describe('GET /ens/v2/chains', () => {
    it('lists eth and base with their coin types', async () => {
      const res = await request(app.getHttpServer()).get('/ens/v2/chains').expect(200);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'eth', coin: COIN_ETH }),
          expect.objectContaining({ name: 'base', coin: COIN_BASE }),
        ]),
      );
    });
  });

  describe('error handling', () => {
    it('does not swallow a client failure as an empty record', async () => {
      getRecords.mockRejectedValue(new Error('RPC failure'));
      jest.spyOn(console, 'error').mockImplementation(() => undefined);

      await request(app.getHttpServer())
        .get('/ens/v2/texts/vitalik.eth?keys=avatar')
        .expect(500);
    });
  });
});
