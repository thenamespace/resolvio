import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NoCache {
  @ApiProperty({
    description: 'Skip cache and fetch fresh data',
    required: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: any }): boolean => {
    return value && (value === 'true' || value === true);
  })
  noCache?: boolean;
}
