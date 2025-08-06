import { Controller, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ConsultantsService } from './consultants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateConsultantProfileDto } from './dto/consultant-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('consultants')
export class ConsultantsController {
  constructor(private readonly consultantsService: ConsultantsService) {}

  @Get()
  findAll() {
    return this.consultantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultantsService.findOne(id);
  }

  // NEW: A dedicated, protected endpoint for the logged-in user's profile
  @Get('profile')
  findProfile(@Req() req) {
    return this.consultantsService.findProfileForAuthenticatedUser(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Req() req, @Body() updateDto: UpdateConsultantProfileDto) {
    return this.consultantsService.updateProfile(req.user.id, updateDto);
  }
}