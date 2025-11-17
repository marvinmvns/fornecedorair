import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  tenantId: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private toResponseDto(user: User): UserResponseDto {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponseDto;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role || UserRole.ATTENDANT,
      tenantId: dto.tenantId,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const savedUser = await this.userRepo.save(user);
    return this.toResponseDto(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find({
      order: { name: 'ASC' },
    });
    return users.map(user => this.toResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.toResponseDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Check email uniqueness if email is being updated
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: dto.email }
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    if (dto.password) {
      const saltRounds = 10;
      user.passwordHash = await bcrypt.hash(dto.password, saltRounds);
    }

    // Update other fields
    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;
    if (dto.role) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    const savedUser = await this.userRepo.save(user);
    return this.toResponseDto(savedUser);
  }

  async toggleStatus(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    user.isActive = !user.isActive;
    const savedUser = await this.userRepo.save(user);
    return this.toResponseDto(savedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    user.isActive = false;
    await this.userRepo.save(user);
  }
}
