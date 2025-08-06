import { Controller, Post, Get, Body, UseGuards, Patch, UploadedFile, UseInterceptors,Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ConsultantRegisterDto } from './dto/consultant-register.dto'; // <-- Correct Import
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProfileDto, ChangePasswordDto, NotificationSettingsDto } from './dto/profile.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  
  // FIX: This endpoint now correctly uses the ConsultantRegisterDto
  @Post('register/consultant')
  async registerConsultant(@Body() registerDto: ConsultantRegisterDto) {
    return this.authService.registerConsultant(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.sub);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('notifications')
  async updateNotifications(@CurrentUser() user: User, @Body() dto: NotificationSettingsDto) {
    return this.authService.updateNotificationSettings(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.authService.updateAvatar(user.id, file.path);
  }
  
  @Get('ws-test')
  wsTest(@Res() res: Response) {
    res.json({ status: 'WebSocket server is running' });
  }

  @Get('socket-test')
  socketTest() {
    return { status: 'WebSocket server is running', timestamp: new Date() };
  }
}
