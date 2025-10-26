import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        // TODO: implement extraction from bearer header
        return null;
      },
      secretOrKey: process.env.JWT_SECRET || 'change_me',
    } as any);
  }

  async validate(payload: any) {
    // TODO: return user payload or fetch user from DB
    return payload;
  }
}
