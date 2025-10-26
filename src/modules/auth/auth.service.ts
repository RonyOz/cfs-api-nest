import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // TODO: inject UsersService and JwtService

  async signup(dto: any) {
    // TODO: create user, hash password, return token
    throw new Error('Not implemented');
  }

  async login(dto: any) {
    // TODO: validate user and return token
    throw new Error('Not implemented');
  }
}
