import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/orders.service';
import { ProductsService } from 'src/modules/products/products.service';
import { UsersService } from 'src/modules/users/users.service';
import { seedUsers } from './data/seed-user.data';
import { seedProducts } from './data/seed-product.data';
import { seedOrders } from './data/seed-order.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

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


  async insertAllUsers() {
    this.logger.log('Seeding users...');
    for (const u of seedUsers) {
      const exists = await this.usersService.findByEmail(u.email);
      if (exists) {
        this.logger.log(`User ${u.email} already exists — skipping`);
        continue;
      }

      await this.usersService.create(u as any);
      this.logger.log(`Created user ${u.email}`);
    }
  }

  async insertAllProducts() {
    this.logger.log('Seeding products...');
    for (const p of seedProducts) {
      try {
        await this.productsService.findOne(p.name);
        this.logger.log(`Product ${p.name} already exists — skipping`);
      } catch (err) {
        // product not found -> create
        const seller = await this.usersService.findByEmail(p.sellerEmail);
        if (!seller) {
          this.logger.warn(`Seller ${p.sellerEmail} not found for product ${p.name}, skipping`);
          continue;
        }

        await this.productsService.create({
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
        } as any, seller as any);

        this.logger.log(`Created product ${p.name}`);
      }
    }
  }

  async insertAllOrders() {
    this.logger.log('Seeding orders...');

    const existingCount = await this.ordersService.count();
    if (existingCount > 0) {
      this.logger.log(`Orders table already has ${existingCount} records — skipping orders seed`);
      return;
    }

    for (const o of seedOrders) {
      const buyer = await this.usersService.findByEmail(o.buyerEmail);
      if (!buyer) {
        this.logger.warn(`Buyer ${o.buyerEmail} not found — skipping order`);
        continue;
      }

      // Build items: look up product by name
      const items = [] as any[];
      let total = 0;
      let skip = false;

      for (const it of o.items) {
        try {
          const product = await this.productsService.findOne(it.productName);
          const price = Number((product.price as any) || 0);
          items.push({ productId: product.id, quantity: it.quantity, price });
          total += price * it.quantity;
        } catch (err) {
          this.logger.warn(`Product ${it.productName} not found — skipping order for ${o.buyerEmail}`);
          skip = true;
          break;
        }
      }

      if (skip) continue;

      await this.ordersService.create({ items, meetingPlace: o.meetingPlace || 'No especificado' }, buyer);
      this.logger.log(`Created order for ${o.buyerEmail}`);
    }
  }
}
