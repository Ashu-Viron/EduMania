import { IsString, IsNumber, IsEmail, IsEnum } from 'class-validator';

export enum EstimateStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateEstimateDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  estimatedDuration: string;

  @IsString()
  clientName: string;

  @IsEmail()
  clientEmail: string;
}

export class UpdateEstimateStatusDto {
  @IsEnum(EstimateStatus)
  status: EstimateStatus;
}