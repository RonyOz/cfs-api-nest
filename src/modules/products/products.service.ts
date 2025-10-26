import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  // TODO: inject repository and implement product methods
  async findAll() {
    return [];
  }

  async create(dto: any) {
    // TODO: create product
    return {};
  }
}
