import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateConsultationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  consultantName: string;

  @IsDateString()
  scheduledAt: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateConsultationStatusDto {
  @IsEnum(ConsultationStatus)
  status: ConsultationStatus;
}

export class UpdateConsultationNotesDto {
  @IsString()
  notes: string;
}