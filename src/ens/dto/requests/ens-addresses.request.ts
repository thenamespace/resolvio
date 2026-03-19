import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NoCache } from './no-cache.request';

export class EnsAddressesRequest extends NoCache {
  @ApiProperty({
    description:
      'Coin type numbers — repeated (?coins=60&coins=0) or comma-separated (?coins=60,0). Cannot be combined with chains.',
    required: false,
    type: [Number],
    example: [60, 0],
  })
  @IsOptional()
  @Transform(({ value }) => {
    const arr = Array.isArray(value) ? value : String(value).split(',');
    return arr.flatMap((v: string) => String(v).split(',')).map(Number);
  })
  @IsNumber({}, { each: true })
  coins?: number[];

  @ApiProperty({
    description:
      'Chain names — repeated (?chains=eth&chains=btc) or comma-separated (?chains=eth,btc). Cannot be combined with coins.',
    required: false,
    type: [String],
    example: ['eth', 'btc'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    const arr = Array.isArray(value) ? value : String(value).split(',');
    return arr
      .flatMap((v: string) => String(v).split(','))
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  chains?: string[];
}
