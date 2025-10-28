import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';

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
  @ApiOperation({ summary: 'Login and obtain a token' })
  @ApiResponse({ status: 200, description: 'Login succesful' })
  @ApiResponse({ status: 400, description: 'Email and password are required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<{ message: string; token: string }> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @Auth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user profile' })
  @ApiResponse({ status: 401, description: 'No token provided or invalid token' })
  async profile(@GetUser() user: any) {
    return { user };
  }
}
