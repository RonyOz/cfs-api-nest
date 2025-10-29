import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async count() {
    return await this.orderRepository.count();
  }

  async create(dto: { buyerId: string; items: { productId: string; quantity: number; price: number }[]; total?: number }) {
    const { buyerId, items, total } = dto;

    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) throw new NotFoundException('Buyer not found');

    const order = this.orderRepository.create({ buyer, status: 'pending', total: total ?? 0 });

    order.items = [];

    for (const it of items) {
      const product = await this.productRepository.findOne({ where: { id: it.productId } });
      if (!product) throw new NotFoundException(`Product ${it.productId} not found`);

      const orderItem = this.orderItemRepository.create({ quantity: it.quantity, price: it.price, product });
      order.items.push(orderItem);
    }

    try {
      const saved = await this.orderRepository.save(order);
      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Could not create order');
    }
  }

  async findOne(id: string) {
    return await this.orderRepository.findOne({ where: { id }, relations: ['items', 'buyer'] });
  }

  async findAll() {
    return this.orderRepository.find({ relations: ['items', 'buyer'] });
  }
}
