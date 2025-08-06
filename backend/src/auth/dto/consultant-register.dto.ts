import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { RegisterDto } from './auth.dto';

export class ConsultantRegisterDto extends RegisterDto {
    @IsString()
    @IsNotEmpty()
    bio: string;

    @IsArray()
    @IsString({ each: true })
    specialties: string[]; // FIX: Corrected spelling
}