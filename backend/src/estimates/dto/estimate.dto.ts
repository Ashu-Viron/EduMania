import { IsString, IsNotEmpty, IsEmail, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { EstimateStatus } from '@prisma/client';

export class CreateEstimateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;
  
  @IsNumber()
  @Min(1)
  amount: number;
  
  @IsNotEmpty()
  @IsString()
  estimatedDuration: string;
}

export class UpdateEstimateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  clientName?: string;
  
  @IsOptional()
  @IsEmail()
  clientEmail?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;
  
  @IsOptional()
  @IsString()
  estimatedDuration?: string;
  
  @IsOptional()
  @IsEnum(EstimateStatus)
  status?: EstimateStatus;
}

export class UpdateEstimateStatusDto {
  @IsNotEmpty()
  @IsEnum(EstimateStatus)
  status: EstimateStatus;
}