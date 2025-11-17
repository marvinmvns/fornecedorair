import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../domain/entities/user.entity';
import { Tenant } from '../../domain/entities/tenant.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    tenant: {
      id: string;
      name: string;
      slug: string;
      primaryColor: string;
      secondaryColor: string;
      logoUrl: string;
    };
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['tenant'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.tenant.isActive) {
      throw new UnauthorizedException('Tenant inativo');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      accessToken: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
          primaryColor: user.tenant.primaryColor,
          secondaryColor: user.tenant.secondaryColor,
          logoUrl: user.tenant.logoUrl,
        },
      },
    };
  }

  async register(
    email: string,
    password: string,
    name: string,
    tenantId: string,
    role: UserRole = UserRole.ATTENDANT,
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Check if tenant exists
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });

    if (!tenant) {
      throw new ConflictException('Tenant não encontrado');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      passwordHash,
      name,
      tenantId,
      role,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`New user registered: ${email} (${role}) for tenant ${tenant.name}`);

    return savedUser;
  }

  async createFirstAdminUser(tenantId: string): Promise<User> {
    const adminEmail = `admin@${tenantId}.local`;
    const adminPassword = 'admin123'; // Should be changed on first login

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    return this.register(adminEmail, adminPassword, 'Administrador', tenantId, UserRole.ADMIN);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    await this.userRepository.save(user);

    this.logger.log(`User ${user.email} changed password`);
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    user.passwordHash = passwordHash;
    await this.userRepository.save(user);

    // TODO: Send email with temporary password
    this.logger.log(`Password reset for ${email}. Temp password: ${tempPassword}`);
  }
}
