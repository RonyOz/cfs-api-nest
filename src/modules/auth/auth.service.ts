import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, 
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string; jwt: string }> {
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
    const jwt = this.jwtService.sign(payload);
    
    return { message: 'Signup succesful', jwt };
    }

  async login(dto: LoginDto): Promise<{ message: string; jwt: string }> {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
    
    const payload = { id: user.id, username: user.username, role: user.role };
    const jwt = this.jwtService.sign(payload);
    
    return { message: 'Login successful', jwt};
  }
}
