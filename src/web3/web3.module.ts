import { Module } from '@nestjs/common';
import { EthClients } from './eth.clients';

@Module({
  providers: [EthClients],
  exports: [EthClients],
})
export class Web3Module {}
