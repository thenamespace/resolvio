import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppPropertiesModule } from '../src/app-properties/app-properties.module';
import { ENSModule } from '../src/ens/ens.module';
import { LoggerModule } from '../src/logger/logger.module';
import { AddressResult, ContenthashResult, TextResult } from '../src/ens/dto';

// ---------------------------------------------------------------------------
// TestEnsProfile
// ---------------------------------------------------------------------------

export interface TestEnsProfile {
  name: string;
  texts: TextResult[];
  addresses: AddressResult[];
  contenthash: ContenthashResult;
  resolver?: `0x${string}`;
  /** Look up a text record by key. */
  getText(key: string): TextResult | undefined;
  /** Look up an address by chain name (e.g. 'eth') or coin type number (e.g. 60). */
  getAddress(chainOrCoin: string | number): AddressResult | undefined;
}

function buildProfile(
  fields: Omit<TestEnsProfile, 'getText' | 'getAddress'>,
): TestEnsProfile {
  return {
    ...fields,
    getText: (key: string) =>
      fields.texts.find((text: TextResult) => text.key === key),
    getAddress: (chainOrCoin: string | number) => {
      if (typeof chainOrCoin === 'number') {
        return fields.addresses.find(
          (address: AddressResult) => address.coin === chainOrCoin,
        );
      }
      return fields.addresses.find(
        (address: AddressResult) => address.chain === chainOrCoin,
      );
    },
  };
}

// ---------------------------------------------------------------------------
// coin types per SLIP-0044 / EIP-2304
// ---------------------------------------------------------------------------

export const COIN_ETH = 60;
export const COIN_BTC = 0;
export const COIN_OP = 2147483658;
export const COIN_BASE = 2147492101;
export const COIN_MATIC = 2147483785;
export const COIN_CELO = 2147525868; // 0x80000000 + 42220 (Celo chainId)

// ---------------------------------------------------------------------------
// artii.eth — on-chain name
// ---------------------------------------------------------------------------

export const onchainProfile: TestEnsProfile = buildProfile({
  name: 'artii.eth',
  resolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' as `0x${string}`,
  texts: [
    {
      key: 'avatar',
      value: 'https://avatars.namespace.ninja/artii.eth_1750354393.png',
      exists: true,
    },
    { key: 'email', value: 'arthy@namespace.ninja', exists: true },
    { key: 'com.twitter', exists: false },
    { key: 'unknown', exists: false },
  ],
  addresses: [
    {
      coin: COIN_ETH,
      chain: 'eth',
      value: '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8',
      exists: true,
    },
    {
      coin: COIN_BTC,
      chain: 'btc',
      value: '1L2rwrhGFQNR8MpZkTaTjFcZK4mEqxScaA',
      exists: true,
    },
    {
      coin: COIN_OP,
      chain: 'op',
      value: '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8',
      exists: true,
    },
    {
      coin: COIN_BASE,
      chain: 'base',
      value: '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8',
      exists: true,
    },
    {
      coin: COIN_MATIC,
      chain: 'matic',
      value: '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8',
      exists: true,
    },
    {
      coin: COIN_CELO,
      chain: 'celo',
      value: '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8',
      exists: true,
    },
  ],
  contenthash: {
    value: 'ipfs://bafybeid7gdzjx5gtm4cibfkmglflzyalyd3wknzfzxk64dxnq5jegfjgha',
    exists: true,
  },
});

// ---------------------------------------------------------------------------
// offchain name — TODO: replace name and records when available
// ---------------------------------------------------------------------------

export const offchainProfile: TestEnsProfile = buildProfile({
  name: 'arti.offchainsub.eth',
  texts: [
    { key: 'avatar', exists: false },
    { key: 'header', exists: false },
    { key: 'name', value: 'Arti', exists: true },
    { key: 'description', value: 'I do coding and stuff', exists: true },
    { key: 'url', value: 'https://app.namespace.ninja', exists: true },
    { key: 'location', exists: false },
    { key: 'email', exists: false }, // stored as 'mail' in the offchain resolver
    { key: 'com.twitter', exists: false },
    { key: 'com.discord', exists: false },
    { key: 'com.github', exists: false },
    { key: 'org.telegram', exists: false },
    { key: 'com.youtube', exists: false },
  ],
  addresses: [
    {
      coin: COIN_ETH,
      chain: 'eth',
      value: '0x1D84ad46F1ec91b4Bb3208F645aD2fA7aBEc19f8',
      exists: true,
    },
  ],
  contenthash: {
    value: 'ipfs://bafybeid7gdzjx5gtm4cibfkmglflzyalyd3wknzfzxk64dxnq5jegfjgha',
    exists: true,
  },
});

// ---------------------------------------------------------------------------
// App factory — boots the full real module stack; use beforeAll / afterAll
// ---------------------------------------------------------------------------

export async function createTestApp(): Promise<INestApplication<App>> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      AppPropertiesModule,
      LoggerModule,
      ENSModule,
    ],
  }).compile();

  const app = module.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app;
}
