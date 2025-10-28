import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'Signup succesful' })
  @ApiResponse({ status: 400, description: 'Email, password, and username are required' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signup(@Body() dto: SignupDto): Promise<{ message: string; token: string }> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with optional 2FA support' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Email and password are required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or 2FA token required' })
  async login(@Body() dto: LoginDto): Promise<{ message: string; token: string }> {
    return this.authService.login(dto);
  }

  @Post('2fa/enable')
  @Auth()
  @ApiOperation({ summary: 'Enable 2FA for current user' })
  @ApiResponse({ status: 201, description: 'Returns secret and QR code' })
  async enable2FA(@GetUser() user:User): Promise<{ secret: string; qrCode: string }> {
    return this.authService.enable2FA(user);
  }

  @Post('2fa/verify')
  @Auth()
  @ApiOperation({ summary: 'Verify and activate 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async verify2FA(@GetUser() user:User, @Body() dto: Verify2FADto): Promise<{ message: string }> {
    return this.authService.verify2FA(user, dto);
  }

  @Post('2fa/disable')
  @Auth()
  @ApiOperation({ summary: 'Disable 2FA for current user' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(@GetUser() user:User, @Body() dto: Verify2FADto): Promise<{ message: string }> {
    return this.authService.disable2FA(user, dto);
  }

  @Get('profile')
  @Auth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user profile' })
  @ApiResponse({ status: 401, description: 'No token provided or invalid token' })
  async profile(@GetUser() user: User) {
    return { user };
  }
}
