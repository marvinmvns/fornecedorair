import { Controller, Post, Body, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';

class LoginDto {
  email: string;
  password: string;
}

class RegisterDto {
  email: string;
  password: string;
  name: string;
  tenantId: string;
}

class ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

class ResetPasswordDto {
  email: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.tenantId,
    );

    return {
      success: true,
      message: 'Usuário criado com sucesso',
      userId: user.id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('change-password')
  @ApiOperation({ summary: 'Alterar senha' })
  async changePassword(@CurrentUser() user: any, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(user.id, changePasswordDto.oldPassword, changePasswordDto.newPassword);

    return {
      success: true,
      message: 'Senha alterada com sucesso',
    };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Solicitar reset de senha' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.email);

    return {
      success: true,
      message: 'Se o email existir, você receberá instruções para reset de senha',
    };
  }
}
