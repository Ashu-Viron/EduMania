import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsEnum ,IsOptional} from 'class-validator';
import { ConsultationStatus } from '@prisma/client';

export class CreateConsultationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  consultantId: string;

  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;

  @IsNumber()
  @Min(15)
  duration: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateConsultationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  consultantId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
  
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;
}

export class UpdateConsultationStatusDto {
  @IsEnum(ConsultationStatus)
  status: ConsultationStatus;
}

export class UpdateConsultationNotesDto {
  @IsString()
  notes: string;
}