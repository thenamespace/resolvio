import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { EnsReverseController } from './ens.reverse-controller';
import { EnsReverseResolverV2 } from './ens.reverse-resolver';
import { EnsForwardResolver } from './ens.forward-resolver';
import { ProfileResponse } from './dto/responses/forward.response';
import { ReverseResolveResult } from './dto/responses/reverse.response';

describe('GET /ens/v2/reverse/:address/profile', () => {
  let app: INestApplication<App>;
  let reverseResolveOne: jest.MockedFunction<
    EnsReverseResolverV2['resolveOne']
  >;
  let forwardResolveProfile: jest.MockedFunction<
    EnsForwardResolver['resolveProfile']
  >;

  const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  const NAME = 'vitalik.eth';

  beforeEach(async () => {
    reverseResolveOne = jest.fn();
    forwardResolveProfile = jest.fn();

    const moduleRef = await Test.createTestingModule({
      controllers: [EnsReverseController],
      providers: [
        {
          provide: EnsReverseResolverV2,
          useValue: { resolveOne: reverseResolveOne },
        },
        {
          provide: EnsForwardResolver,
          useValue: { resolveProfile: forwardResolveProfile },
        },
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

  function mockReverseResult(
    hasReverseRecord: boolean,
    name?: string,
  ): ReverseResolveResult {
    return {
      address: ADDRESS,
      hasReverseRecord,
      name,
    };
  }

  function buildProfile(
    texts: ProfileResponse['texts'],
    overrides: Partial<ProfileResponse> = {},
  ): ProfileResponse {
    return {
      name: NAME,
      texts,
      addresses: [],
      contenthash: { exists: false },
      ...overrides,
    };
  }
  const notCalledReverse = () =>
    expect(reverseResolveOne).not.toHaveBeenCalled();
  const notCalledForward = () =>
    expect(forwardResolveProfile).not.toHaveBeenCalled();
  const calledReverseWith = (address: string, noCache: boolean) =>
    expect(reverseResolveOne).toHaveBeenCalledWith(address, noCache);
  const calledForwardWith = (name: string, expected: Record<string, unknown>) =>
    expect(forwardResolveProfile).toHaveBeenCalledWith(
      name,
      expect.objectContaining(expected),
    );

  it('returns 400 for an invalid Ethereum address', async () => {
    const res = await request(app.getHttpServer())
      .get('/ens/v2/reverse/notanaddress/profile')
      .expect(400);

    expect((res.body as { message: string }).message).toBe(
      'Invalid Ethereum address',
    );
    notCalledReverse();
    notCalledForward();
  });

  it('returns a stable null response and skips the forward resolver when no reverse record exists', async () => {
    reverseResolveOne.mockResolvedValue(mockReverseResult(false, undefined));

    const res = await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${ADDRESS}/profile`)
      .expect(200);

    expect(res.body).toEqual({
      address: ADDRESS,
      hasReverseRecord: false,
      name: null,
      avatar: null,
      displayName: null,
      description: null,
      profile: null,
    });
    calledReverseWith(ADDRESS, false);
    notCalledForward();
  });

  it('resolves the profile and extracts convenience fields when a verified reverse record exists', async () => {
    const profile = buildProfile([
      { key: 'avatar', value: 'https://example.com/avatar.png', exists: true },
      { key: 'name', value: 'Vitalik', exists: true },
      { key: 'description', value: 'Ethereum founder', exists: true },
    ]);

    reverseResolveOne.mockResolvedValue(mockReverseResult(true, NAME));
    forwardResolveProfile.mockResolvedValue(profile);

    const res = await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${ADDRESS}/profile?noCache=true`)
      .expect(200);

    expect(res.body as Record<string, unknown>).toEqual({
      address: ADDRESS,
      hasReverseRecord: true,
      name: NAME,
      avatar: 'https://example.com/avatar.png',
      displayName: 'Vitalik',
      description: 'Ethereum founder',
      profile,
    });
    calledReverseWith(ADDRESS, true);
    calledForwardWith(NAME, { noCache: true });
  });

  it('returns null convenience fields when the requested text records are missing', async () => {
    const profile = buildProfile([
      { key: 'avatar', exists: false },
      { key: 'name', exists: false },
      { key: 'description', exists: false },
    ]);

    reverseResolveOne.mockResolvedValue(mockReverseResult(true, NAME));
    forwardResolveProfile.mockResolvedValue(profile);

    const res = await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${ADDRESS}/profile`)
      .expect(200);

    expect(res.body as Record<string, unknown>).toMatchObject({
      address: ADDRESS,
      hasReverseRecord: true,
      name: NAME,
      avatar: null,
      displayName: null,
      description: null,
    });
    expect((res.body as { profile: ProfileResponse }).profile).toEqual(profile);
  });

  it('propagates noCache and custom profile query options to both resolvers', async () => {
    const profile = buildProfile([
      { key: 'email', value: 'vitalik@example.com', exists: true },
    ]);

    reverseResolveOne.mockResolvedValue(mockReverseResult(true, NAME));
    forwardResolveProfile.mockResolvedValue(profile);

    await request(app.getHttpServer())
      .get(
        `/ens/v2/reverse/${ADDRESS}/profile?texts=email&addresses=btc&contenthash=false&noCache=true`,
      )
      .expect(200);

    calledReverseWith(ADDRESS, true);
    calledForwardWith(NAME, {
      texts: ['email'],
      addresses: ['btc'],
      contenthash: false,
      noCache: true,
    });
  });

  it('does not convert a reverse resolver failure into an unresolved response', async () => {
    reverseResolveOne.mockRejectedValue(new Error('RPC failure'));

    await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${ADDRESS}/profile`)
      .expect(500);

    notCalledForward();
  });

  it('does not convert a forward resolver failure into an unresolved response', async () => {
    reverseResolveOne.mockResolvedValue(mockReverseResult(true, NAME));
    forwardResolveProfile.mockRejectedValue(new Error('forward RPC failure'));

    await request(app.getHttpServer())
      .get(`/ens/v2/reverse/${ADDRESS}/profile`)
      .expect(500);
  });
});
