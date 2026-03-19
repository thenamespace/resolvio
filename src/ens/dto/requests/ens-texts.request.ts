import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NoCache } from './no-cache.request';

export class EnsTextsRequest extends NoCache {
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description:
      'Array of text record keys — repeated params (?keys=avatar&keys=email) or comma-separated (?keys=avatar,email)',
    required: false,
    type: [String],
    example: ['avatar', 'description', 'keywords'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    const arr = Array.isArray(value) ? value : String(value).split(',');
    return arr
      .flatMap((v: string) => String(v).split(','))
      .map((k: string) => k.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsString({ each: true })
  keys?: string[];
}
