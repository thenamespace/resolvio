import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import { ProfileRequest } from './profile.request';

function splitNames(value: unknown): string[] {
  const arr = Array.isArray(value) ? value : [String(value)];
  return arr
    .flatMap((v: string) => String(v).split(','))
    .map((s: string) => s.trim())
    .filter(Boolean);
}

export class BulkProfileRequest extends ProfileRequest {
  @Transform(({ value }) => splitNames(value))
  @IsArray()
  @IsString({ each: true })
  names: string[];
}
