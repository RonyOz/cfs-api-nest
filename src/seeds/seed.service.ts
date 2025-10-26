import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  // TODO: inject repositories/services for users, products
  async run() {
    // TODO: create an admin user and a few products
    // Example: create user { email: 'admin@example.com', username: 'admin', password: 'TODO-hash', role: 'admin' }
    return { message: 'Seed run (placeholder) - implement creation logic' };
  }
}
