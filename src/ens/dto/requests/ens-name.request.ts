import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnsNameRequest {
  @ApiProperty({
    description: 'ENS name to resolve',
    example: 'vitalik.eth',
    minLength: 6,
    maxLength: 256,
  })
  @IsString()
  @Length(6, 256, {
    message:
      'ENS name must be between 6 and 256 characters (e.g. "example.eth").',
  })
  @Transform(({ value }) => String(value).trim().toLowerCase())
  name: string;
}
