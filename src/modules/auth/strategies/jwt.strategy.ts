import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Jwt } from '../interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,) {
    super({
      secretOrKey: configService.get('JWT_SECRET') as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
  }

  async validate(payload: Jwt): Promise<User> {
    const {id} = payload;

    if (!id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException(`Token not valid`);

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword as User;
  }
}
