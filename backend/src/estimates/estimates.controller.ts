import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { CreateEstimateDto, UpdateEstimateDto, UpdateEstimateStatusDto } from './dto/estimate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, new UserRoleGuard(UserRole.USER))
@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  create(@Req() req, @Body() createEstimateDto: CreateEstimateDto) {
    return this.estimatesService.create(req.user.id, createEstimateDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.estimatesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.estimatesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateEstimateDto: UpdateEstimateDto) {
    return this.estimatesService.update(id, req.user.id, updateEstimateDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Req() req, @Body() updateStatusDto: UpdateEstimateStatusDto) {
    return this.estimatesService.updateStatus(id, req.user.id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.estimatesService.remove(id, req.user.id);
  }
}