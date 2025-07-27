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
import { EstimatesService } from './estimates.service';
import { CreateEstimateDto, UpdateEstimateStatusDto } from './dto/estimate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('estimates')
@UseGuards(JwtAuthGuard)
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createEstimateDto: CreateEstimateDto) {
    return this.estimatesService.create(user.sub, createEstimateDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.estimatesService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.estimatesService.findOne(id, user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateStatusDto: UpdateEstimateStatusDto,
  ) {
    return this.estimatesService.updateStatus(id, user.sub, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.estimatesService.remove(id, user.sub);
  }
}