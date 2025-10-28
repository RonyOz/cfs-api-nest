import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, 
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string; token: string }> {
    const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('User already exists');
    
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      role: 'user',
    });

    await this.usersRepository.save(user);
   
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    
    return { message: 'Signup succesful', token };
    }

  async login(dto: LoginDto): Promise<{ message: string; token: string }> {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.twoFactorEnabled) {
      if (!dto.token) {
        throw new UnauthorizedException('2FA token is required');
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: dto.token,
        window: 1,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA token');
      }
    }
    
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    
    return { message: 'Login successful', token };
  }

  async enable2FA(user:User): Promise<{ secret: string; qrCode: string }> {

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `CFS API (${user.email})`,
      length: 32,
    });

    user.twoFactorSecret = secret.base32;
    await this.usersRepository.save(user);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return { secret: secret.base32, qrCode };
  }

  async verify2FA(user:User, dto: Verify2FADto): Promise<{ message: string }> {

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA is not set up. Enable it first.');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.token,
      window: 1,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    user.twoFactorEnabled = true;
    await this.usersRepository.save(user);

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(user:User, dto: Verify2FADto): Promise<{ message: string }> {

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.token,
      window: 1,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.usersRepository.save(user);

    return { message: '2FA disabled successfully' };
  }
}
