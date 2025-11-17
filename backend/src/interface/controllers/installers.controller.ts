import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { InstallersService, CreateInstallerDto, UpdateInstallerDto } from '../../application/services/installers.service';

export class CreateInstallerRequestDto implements CreateInstallerDto {
  @IsString()
  name: string;

  @IsString()
  whatsappNumber: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  tenantId: string;
}

export class UpdateInstallerRequestDto implements UpdateInstallerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;
}

@ApiTags('installers')
@Controller('installers')
export class InstallersController {
  constructor(private readonly installersService: InstallersService) {}

  @Post()
  @ApiOperation({ summary: 'Create installer' })
  create(@Body() dto: CreateInstallerRequestDto) {
    return this.installersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List installers' })
  findAll() {
    return this.installersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get installer by ID' })
  findOne(@Param('id') id: string) {
    return this.installersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update installer' })
  update(@Param('id') id: string, @Body() dto: UpdateInstallerRequestDto) {
    return this.installersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete installer' })
  remove(@Param('id') id: string) {
    return this.installersService.remove(id);
  }
}
