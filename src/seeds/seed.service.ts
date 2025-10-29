import { Injectable } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { ProductsService } from 'src/modules/products/products.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class SeedService {

  constructor(
    private usersService: UsersService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) { }

  async run() {
    await this.insertAllUsers();
    await this.insertAllProducts();
    await this.insertAllOrders();
    return { message: 'Seeding completed' };
  }

  async insertAllUsers() { }

  async insertAllProducts() { }

  async insertAllOrders() { }
}
