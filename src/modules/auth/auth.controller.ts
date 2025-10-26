import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'Signup succesful' })
  async signup(@Body() dto: SignupDto): Promise<{ message: string; token?: string }> {
    // TODO: implement authService.signup
    return { message: 'Signup succesful', token: 'TODO' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and obtain a token' })
  @ApiResponse({ status: 200, description: 'Login succesful' })
  async login(@Body() dto: LoginDto): Promise<{ message: string; token?: string }> {
    // TODO: implement authService.login
    return { message: 'Login succesful', token: 'TODO' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async profile(@Req() req) {
    // TODO: return user profile (without password)
    return { user: 'TODO' };
  }
}
