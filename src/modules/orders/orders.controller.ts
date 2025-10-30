import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/v1/orders
   * Crear una nueva orden
   * - Rol: Usuario autenticado (buyer)
   * - Valida stock disponible
   * - Calcula total automáticamente
   * - Reduce stock de productos
   */
  @Post()
  @Auth('user') // Solo usuarios autenticados (no admin necesario)
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a new order with the specified items. Validates stock availability and automatically calculates the total. Stock is reduced upon order creation.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid items, insufficient stock, or trying to purchase own products',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  /**
   * GET /api/v1/orders
   * Obtener todas las órdenes
   * - Rol: Solo admin
   * - Incluye información de buyers, sellers, items y productos
   */
  @Get()
  @Auth('admin') // Solo admin puede ver todas las órdenes
  @ApiOperation({
    summary: 'Get all orders (Admin only)',
    description:
      'Retrieves all orders in the system with complete information including buyers, sellers, items, and products',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all orders retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * GET /api/v1/orders/:id
   * Obtener detalles de una orden específica
   * - Buyer puede ver sus órdenes
   * - Seller puede ver órdenes con sus productos
   * - Admin puede ver todas
   */
  @Get(':id')
  @Auth() // Cualquier usuario autenticado, se valida ownership en el service
  @ApiOperation({
    summary: 'Get order details',
    description:
      'Retrieves details of a specific order. Buyers can see their orders, sellers can see orders containing their products, and admins can see all orders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You do not have permission to access this order',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.ordersService.findOne(id, user);
  }

  /**
   * PUT /api/v1/orders/:id/status
   * Actualizar el estado de una orden
   * - Rol: Seller de los productos en la orden, o admin
   * - Valida transiciones de estado válidas
   */
  @Put(':id/status')
  @Auth('user') // Usuario o admin
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Updates the status of an order. Only sellers of products in the order or admins can perform this action. Validates state transitions (pending → accepted → delivered, or canceled at any point).',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid status transition',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only sellers of products in this order can update status',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user);
  }

  /**
   * DELETE /api/v1/orders/:id
   * Cancelar una orden
   * - Rol: Solo el buyer de la orden
   * - Solo si está en estado 'pending'
   * - Restaura el stock de productos
   */
  @Delete(':id')
  @Auth('user') // Usuario autenticado
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancels a pending order and restores product stock. Only the buyer can cancel their own orders, and only if the order is in pending status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order canceled successfully and stock restored',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Order cannot be canceled (not in pending status)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only cancel your own orders',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  cancel(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.ordersService.cancel(id, user);
  }
  
}