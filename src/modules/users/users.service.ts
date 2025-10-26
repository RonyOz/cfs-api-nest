import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // TODO: inject repository and implement methods
  async findAll() {
    return [];
  }

  async create(dto: any) {
    // TODO: create user
    return {};
  }

  async findOne(id: string) {
    // TODO: find user
    return null;
  }

  async update(id: string, dto: any) {
    // TODO: update user
    return {};
  }

  async remove(id: string) {
    // TODO: delete user
    return;
  }
}
