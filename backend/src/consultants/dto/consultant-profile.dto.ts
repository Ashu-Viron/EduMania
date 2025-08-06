import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class UpdateConsultantProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
