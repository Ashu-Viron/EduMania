import { IsString, IsOptional, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}

export class NotificationSettingsDto {
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    email: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    push: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    sms: boolean;
    
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    newEstimates: boolean;
    
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    estimateUpdates: boolean;
    
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    newConsultations: boolean;
    
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    consultationReminders: boolean;
}