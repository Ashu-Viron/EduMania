import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, UpdateConsultationDto, UpdateConsultationNotesDto, UpdateConsultationStatusDto } from './dto/consultation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @UseGuards(new UserRoleGuard(UserRole.USER))
  create(@Req() req, @Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationsService.create(req.user.id, createConsultationDto);
  }
  
  @Get()
  @UseGuards(new UserRoleGuard(UserRole.USER))
  findAllForUser(@Req() req) {
    return this.consultationsService.findAllForUser(req.user.id);
  }

  @Get('for-consultant')
  @UseGuards(new UserRoleGuard(UserRole.CONSULTANT))
  findAllForConsultant(@Req() req) {
    return this.consultationsService.findAllForConsultant(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.consultationsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateConsultationDto: UpdateConsultationDto) {
    return this.consultationsService.update(id, req.user.id, updateConsultationDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Req() req, @Body() updateStatusDto: UpdateConsultationStatusDto) {
    return this.consultationsService.updateStatus(id, req.user.id, req.user.role, updateStatusDto);
  }

  @Patch(':id/notes')
  @UseGuards(new UserRoleGuard(UserRole.CONSULTANT))
  addNotes(@Param('id') id: string, @Req() req, @Body() updateNotesDto: UpdateConsultationNotesDto) {
    return this.consultationsService.addNotes(id, req.user.id, updateNotesDto);
  }

  @Delete(':id')
  @UseGuards(new UserRoleGuard(UserRole.USER))
  remove(@Param('id') id: string, @Req() req) {
    return this.consultationsService.remove(id, req.user.id);
  }
}