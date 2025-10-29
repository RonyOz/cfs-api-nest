import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  async create(@Body() dto: CreateOrderDto) {
    // TODO: create order
    return { message: 'Order created', order: 'TODO' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (public)' })
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // TODO: return order by id
    return { order: 'TODO' };
  }
}
