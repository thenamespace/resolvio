import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { EnsForwardController } from '../src/ens/ens.forward-controller';
import { EnsForwardResolver } from '../src/ens/ens.forward-resolver';

const NAME = 'artii.eth';

const EVM_ADDRESS = '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8';
const ETH_ADDRESS = EVM_ADDRESS;
const BTC_ADDRESS = '1L2rwrhGFQNR8MpZkTaTjFcZK4mEqxScaA';
const BASE_ADDRESS = EVM_ADDRESS;

// coin types per SLIP-0044 / EIP-2304
const COIN_ETH   = 60;
const COIN_BTC   = 0;
const COIN_OP    = 2147483658;
const COIN_BASE  = 2147492101;
const COIN_MATIC = 2147483785;
const COIN_CELO  = 2147484668;
const AVATAR_URL = 'https://avatars.namespace.ninja/artii.eth_1750354393.png';
const EMAIL = 'arthy@namespace.ninja';
const CONTENTHASH = 'ipfs://bafybeid7gdzjx5gtm4cibfkmglflzyalyd3wknzfzxk64dxnq5jegfjgha';

const mockTextsResponse = {
  name: NAME,
  texts: [
    { key: 'avatar', value: AVATAR_URL, exists: true },
    { key: 'email', value: EMAIL, exists: true },
  ],
};

const mockAddressesResponse = {
  name: NAME,
  addresses: [
    { coin: 60, value: ETH_ADDRESS, exists: true },
    { coin: 0, value: BTC_ADDRESS, exists: true },
    { coin: 2147492101, value: BASE_ADDRESS, exists: true },
  ],
};

const mockContenthashResponse = {
  value: CONTENTHASH,
  exists: true,
};

describe('EnsForwardController (e2e)', () => {
  let app: INestApplication<App>;
  let resolver: jest.Mocked<EnsForwardResolver>;

  beforeEach(async () => {
    const mockResolver = {
      resolveTexts: jest.fn(),
      resolveAddresses: jest.fn(),
      resolveContenthash: jest.fn(),
      clearCache: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [EnsForwardController],
      providers: [{ provide: EnsForwardResolver, useValue: mockResolver }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    resolver = module.get(EnsForwardResolver);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // GET /ens/v2/texts/:name
  // ---------------------------------------------------------------------------

  describe('GET /ens/v2/texts/:name', () => {
    it('returns avatar and email for artii.eth', async () => {
      resolver.resolveTexts.mockResolvedValue(mockTextsResponse);

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/texts/${NAME}?keys=avatar&keys=email`)
        .expect(200);

      expect(res.body).toEqual(mockTextsResponse);
      expect(res.body.texts).toContainEqual({ key: 'avatar', value: AVATAR_URL, exists: true });
      expect(res.body.texts).toContainEqual({ key: 'email', value: EMAIL, exists: true });
      expect(resolver.resolveTexts).toHaveBeenCalledWith(
        expect.objectContaining({ name: NAME, keys: ['avatar', 'email'] }),
      );
    });

    it('returns texts with no keys', async () => {
      resolver.resolveTexts.mockResolvedValue({ name: NAME, texts: [] });

      await request(app.getHttpServer())
        .get(`/ens/v2/texts/${NAME}`)
        .expect(200);

      expect(resolver.resolveTexts).toHaveBeenCalledWith(
        expect.objectContaining({ name: NAME }),
      );
    });

    it('normalises name to lowercase', async () => {
      resolver.resolveTexts.mockResolvedValue({ name: NAME, texts: [] });

      await request(app.getHttpServer())
        .get('/ens/v2/texts/ARTII.ETH')
        .expect(200);

      expect(resolver.resolveTexts).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'artii.eth' }),
      );
    });

    it('returns 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/texts/a.b')
        .expect(400);

      expect(resolver.resolveTexts).not.toHaveBeenCalled();
    });

    it('returns exists:false for keys with no record', async () => {
      resolver.resolveTexts.mockResolvedValue({
        name: NAME,
        texts: [{ key: 'github', exists: false }],
      });

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/texts/${NAME}?keys=github`)
        .expect(200);

      expect(res.body.texts[0]).toEqual({ key: 'github', exists: false });
    });
  });

  // ---------------------------------------------------------------------------
  // GET /ens/v2/addresses/:name
  // ---------------------------------------------------------------------------

  describe('GET /ens/v2/addresses/:name', () => {
    it('returns eth address by default', async () => {
      const ethOnly = {
        name: NAME,
        addresses: [{ coin: 60, value: ETH_ADDRESS, exists: true }],
      };
      resolver.resolveAddresses.mockResolvedValue(ethOnly);

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}`)
        .expect(200);

      expect(res.body.addresses[0]).toEqual({ coin: 60, value: ETH_ADDRESS, exists: true });
    });

    it('returns btc, eth and base addresses when coins are specified', async () => {
      resolver.resolveAddresses.mockResolvedValue(mockAddressesResponse);

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}?coins=60&coins=0&coins=2147492101`)
        .expect(200);

      expect(res.body.addresses).toContainEqual({ coin: 60, value: ETH_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: 0, value: BTC_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: 2147492101, value: BASE_ADDRESS, exists: true });
      expect(resolver.resolveAddresses).toHaveBeenCalledWith(
        NAME,
        expect.objectContaining({ coins: [60, 0, 2147492101] }),
      );
    });

    it('passes noCache=true to resolver', async () => {
      resolver.resolveAddresses.mockResolvedValue(mockAddressesResponse);

      await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}?noCache=true`)
        .expect(200);

      expect(resolver.resolveAddresses).toHaveBeenCalledWith(
        NAME,
        expect.objectContaining({ noCache: true }),
      );
    });

    it('returns 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/addresses/a.b')
        .expect(400);

      expect(resolver.resolveAddresses).not.toHaveBeenCalled();
    });

    it('returns exists:false for coin with no record', async () => {
      resolver.resolveAddresses.mockResolvedValue({
        name: NAME,
        addresses: [{ coin: 501, exists: false }],
      });

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}?coins=501`)
        .expect(200);

      expect(res.body.addresses[0]).toEqual({ coin: 501, exists: false });
    });

    it('returns addresses for eth, btc, op, base, matic, celo by coin type', async () => {
      const multiChainResponse = {
        name: NAME,
        addresses: [
          { coin: COIN_ETH,   value: EVM_ADDRESS, exists: true },
          { coin: COIN_BTC,   value: BTC_ADDRESS, exists: true },
          { coin: COIN_OP,    value: EVM_ADDRESS, exists: true },
          { coin: COIN_BASE,  value: EVM_ADDRESS, exists: true },
          { coin: COIN_MATIC, value: EVM_ADDRESS, exists: true },
          { coin: COIN_CELO,  value: EVM_ADDRESS, exists: true },
        ],
      };
      resolver.resolveAddresses.mockResolvedValue(multiChainResponse);

      const res = await request(app.getHttpServer())
        .get(
          `/ens/v2/addresses/${NAME}` +
          `?coins=${COIN_ETH}&coins=${COIN_BTC}&coins=${COIN_OP}` +
          `&coins=${COIN_BASE}&coins=${COIN_MATIC}&coins=${COIN_CELO}`,
        )
        .expect(200);

      expect(res.body.addresses).toContainEqual({ coin: COIN_ETH,   value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_BTC,   value: BTC_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_OP,    value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_BASE,  value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_MATIC, value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_CELO,  value: EVM_ADDRESS, exists: true });
      expect(resolver.resolveAddresses).toHaveBeenCalledWith(
        NAME,
        expect.objectContaining({
          coins: [COIN_ETH, COIN_BTC, COIN_OP, COIN_BASE, COIN_MATIC, COIN_CELO],
        }),
      );
    });

    it('returns addresses for eth, btc, op, base, matic, celo by chain name', async () => {
      const multiChainResponse = {
        name: NAME,
        addresses: [
          { coin: COIN_ETH,   value: EVM_ADDRESS, exists: true },
          { coin: COIN_BTC,   value: BTC_ADDRESS, exists: true },
          { coin: COIN_OP,    value: EVM_ADDRESS, exists: true },
          { coin: COIN_BASE,  value: EVM_ADDRESS, exists: true },
          { coin: COIN_MATIC, value: EVM_ADDRESS, exists: true },
          { coin: COIN_CELO,  value: EVM_ADDRESS, exists: true },
        ],
      };
      resolver.resolveAddresses.mockResolvedValue(multiChainResponse);

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}?chains=eth&chains=btc&chains=op&chains=base&chains=matic&chains=celo`)
        .expect(200);

      expect(res.body.addresses).toContainEqual({ coin: COIN_ETH,   value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_BTC,   value: BTC_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_OP,    value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_BASE,  value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_MATIC, value: EVM_ADDRESS, exists: true });
      expect(res.body.addresses).toContainEqual({ coin: COIN_CELO,  value: EVM_ADDRESS, exists: true });
      expect(resolver.resolveAddresses).toHaveBeenCalledWith(
        NAME,
        expect.objectContaining({ chains: ['eth', 'btc', 'op', 'base', 'matic', 'celo'] }),
      );
    });

    it('accepts comma-separated chain names', async () => {
      resolver.resolveAddresses.mockResolvedValue({
        name: NAME,
        addresses: [
          { coin: COIN_ETH,  value: EVM_ADDRESS, exists: true },
          { coin: COIN_BTC,  value: BTC_ADDRESS, exists: true },
          { coin: COIN_OP,   value: EVM_ADDRESS, exists: true },
        ],
      });

      await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}?chains=eth,btc,op`)
        .expect(200);

      expect(resolver.resolveAddresses).toHaveBeenCalledWith(
        NAME,
        expect.objectContaining({ chains: ['eth', 'btc', 'op'] }),
      );
    });

    it('returns 400 when both coins and chains are provided', async () => {
      resolver.resolveAddresses.mockRejectedValue(
        new BadRequestException('Provide either coins or chains, not both'),
      );

      await request(app.getHttpServer())
        .get(`/ens/v2/addresses/${NAME}?coins=60&chains=eth`)
        .expect(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /ens/v2/contenthash/:name
  // ---------------------------------------------------------------------------

  describe('GET /ens/v2/contenthash/:name', () => {
    it('returns ipfs contenthash for artii.eth', async () => {
      resolver.resolveContenthash.mockResolvedValue(mockContenthashResponse);

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/contenthash/${NAME}`)
        .expect(200);

      expect(res.body).toEqual(mockContenthashResponse);
      expect(res.body.value).toBe(CONTENTHASH);
      expect(res.body.exists).toBe(true);
      expect(resolver.resolveContenthash).toHaveBeenCalledWith(NAME, undefined);
    });

    it('passes noCache=true to resolver', async () => {
      resolver.resolveContenthash.mockResolvedValue(mockContenthashResponse);

      await request(app.getHttpServer())
        .get(`/ens/v2/contenthash/${NAME}?noCache=true`)
        .expect(200);

      expect(resolver.resolveContenthash).toHaveBeenCalledWith(NAME, true);
    });

    it('returns 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .get('/ens/v2/contenthash/a.b')
        .expect(400);

      expect(resolver.resolveContenthash).not.toHaveBeenCalled();
    });

    it('returns exists:false when no contenthash is set', async () => {
      resolver.resolveContenthash.mockResolvedValue({ exists: false });

      const res = await request(app.getHttpServer())
        .get(`/ens/v2/contenthash/${NAME}`)
        .expect(200);

      expect(res.body).toEqual({ exists: false });
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /ens/v2/cache/:name
  // ---------------------------------------------------------------------------

  describe('DELETE /ens/v2/cache/:name', () => {
    it('clears cache for artii.eth and returns 204', async () => {
      resolver.clearCache.mockReturnValue(undefined);

      await request(app.getHttpServer())
        .delete(`/ens/v2/cache/${NAME}`)
        .expect(204);

      expect(resolver.clearCache).toHaveBeenCalledWith(NAME);
    });

    it('returns 400 when name is too short', async () => {
      await request(app.getHttpServer())
        .delete('/ens/v2/cache/a.b')
        .expect(400);

      expect(resolver.clearCache).not.toHaveBeenCalled();
    });
  });
});
