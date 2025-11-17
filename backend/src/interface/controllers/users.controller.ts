import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { UsersService, CreateUserDto, UpdateUserDto } from '../../application/services/users.service';
import { UserRole } from '../../domain/entities/user.entity';

export class CreateUserRequestDto implements CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  tenantId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserRequestDto implements UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  create(@Body() dto: CreateUserRequestDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserRequestDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle user active status' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
