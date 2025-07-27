import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, UpdateConsultationStatusDto, UpdateConsultationNotesDto } from './dto/consultation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationsService.create(user.sub, createConsultationDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.consultationsService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.consultationsService.findOne(id, user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateStatusDto: UpdateConsultationStatusDto,
  ) {
    return this.consultationsService.updateStatus(id, user.sub, updateStatusDto);
  }

  @Patch(':id/notes')
  updateNotes(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateNotesDto: UpdateConsultationNotesDto,
  ) {
    return this.consultationsService.updateNotes(id, user.sub, updateNotesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.consultationsService.remove(id, user.sub);
  }
}