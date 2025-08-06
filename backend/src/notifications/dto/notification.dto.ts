import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}