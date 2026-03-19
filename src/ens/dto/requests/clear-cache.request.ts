import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ForwardCacheType {
  TEXTS = 'texts',
  ADDRESSES = 'addresses',
  ALL = 'all',
}

export class ClearForwardCacheRequest {
  @ApiProperty({
    enum: ForwardCacheType,
    default: ForwardCacheType.ALL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ForwardCacheType, {
    message: `type must be one of: ${Object.values(ForwardCacheType).join(', ')}`,
  })
  type?: ForwardCacheType = ForwardCacheType.ALL;
}
