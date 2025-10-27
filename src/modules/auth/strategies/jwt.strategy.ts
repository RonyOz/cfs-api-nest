import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change_me',
    });
  }

  async validate(payload: any) {
    if (!payload.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // TODO: fetch full user from DB for production
    // const user = await this.userRepository.findOneBy({id});
    // if(!user) throw new UnauthorizedException(`Token not valid`);

    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };
  }
}
