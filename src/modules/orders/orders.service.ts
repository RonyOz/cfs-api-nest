import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ValidRoles } from '../auth/enums/roles.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    public readonly productRepository: Repository<Product>, // public para tests
    @InjectRepository(User)
    public readonly userRepository: Repository<User>, // Agregar para tests
    private readonly dataSource: DataSource, // Para transacciones
  ) { }

  /**
   * Crear una nueva orden
   * - Valida stock disponible
   * - Calcula el total automáticamente
   * - Reduce el stock de productos
   * - Crea la orden y los items en una transacción
   */
  async create(createOrderDto: CreateOrderDto, buyer: User): Promise<Order> {
    const { items } = createOrderDto;

    // Validación básica
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Iniciar transacción para garantizar consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      // Procesar cada item
      for (const item of items) {
        // Buscar producto con su seller
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          relations: ['seller'],
        });

        // Validar que el producto existe
        if (!product) {
          throw new NotFoundException(
            `Product with id ${item.productId} not found`,
          );
        }

        // Validar stock disponible
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        // Prevenir que un usuario compre su propio producto
        if (product.seller.id === buyer.id) {
          throw new BadRequestException(
            `You cannot purchase your own product: "${product.name}"`,
          );
        }

        // Reducir stock del producto
        product.stock -= item.quantity;
        await queryRunner.manager.save(Product, product);

        // Crear OrderItem (guardamos el precio actual del producto)
        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: item.quantity,
          price: product.price, // Precio al momento de la compra
          product: product,
        });

        orderItems.push(orderItem);
        totalAmount += Number(product.price) * item.quantity;
      }

      // Crear la orden
      const order = queryRunner.manager.create(Order, {
        status: OrderStatus.PENDING,
        total: totalAmount,
        buyer: buyer,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Commit de la transacción
      await queryRunner.commitTransaction();

      // Retornar la orden completa con todas sus relaciones
      return this.findOne(savedOrder.id, buyer);
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      // Liberar el query runner
      await queryRunner.release();
    }
  }

  /**
   * Obtener todas las órdenes (solo admin)
   * Incluye información de buyer, items, productos y sellers
   */
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        relations: ['buyer', 'items', 'items.product', 'items.product.seller'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Obtener las órdenes del usuario autenticado
   * Incluye información de items, productos y sellers
   */
  async findMyOrders(user: User): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: { buyer: { id: user.id } },
        relations: ['buyer', 'items', 'items.product', 'items.product.seller'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Obtener las órdenes donde el usuario autenticado es vendedor
   * Retorna órdenes que contienen productos del usuario
   */
  async findMySales(user: User): Promise<Order[]> {
    try {
      // Buscar órdenes que contienen productos del vendedor
      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.buyer', 'buyer')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect('product.seller', 'seller')
        .where('seller.id = :sellerId', { sellerId: user.id })
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      return orders;
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Obtener una orden específica
   * Validaciones:
   * - Buyer puede ver sus propias órdenes
   * - Seller puede ver órdenes que contienen sus productos
   * - Admin puede ver todas
   */
  async findOne(id: string, user: User): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['buyer', 'items', 'items.product', 'items.product.seller'],
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      // Validar que el usuario tiene permiso para ver esta orden
      if (!this.canUserAccessOrder(order, user)) {
        throw new ForbiddenException(
          'You do not have permission to access this order',
        );
      }

      return order;
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Actualizar el estado de una orden
   * Solo el seller de los productos o admin puede actualizar
   * Valida transiciones de estado válidas
   */
  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    user: User,
  ): Promise<Order> {
    const { status } = updateOrderStatusDto;

    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['buyer', 'items', 'items.product', 'items.product.seller'],
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      // Validar que el usuario es seller de los productos en la orden o admin
      if (!this.isUserSellerOfOrder(order, user) && user.role !== 'admin') {
        throw new ForbiddenException(
          'Only sellers of products in this order or admins can update its status',
        );
      }

      // Validar que la transición de estado es válida
      this.validateStatusTransition(order.status, status);

      // Actualizar el estado
      order.status = status;
      await this.orderRepository.save(order);

      return this.findOne(id, user);
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Cancelar una orden (solo el buyer)
   * - Solo se puede cancelar si está en estado 'pending'
   * - Restaura el stock de los productos
   * - Usa transacción para garantizar consistencia
   */
  async cancel(id: string, user: User): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['buyer', 'items', 'items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      // Solo el buyer puede cancelar su propia orden
      if (order.buyer.id !== user.id && user.role !== ValidRoles.admin) {
        throw new ForbiddenException('You can only cancel your own orders');
      }

      // Solo se puede cancelar si está en estado pending
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `Cannot cancel order with status "${order.status}". Only pending orders can be canceled`,
        );
      }

      // Restaurar el stock de cada producto
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product.id },
        });

        if (product) {
          product.stock += item.quantity;
          await queryRunner.manager.save(Product, product);
        }
      }

      // Cambiar estado a canceled
      order.status = OrderStatus.CANCELED;
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return this.findOne(id, user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Verifica si un usuario puede acceder a una orden
   * - Admin puede ver todo
   * - Buyer puede ver sus órdenes
   * - Seller puede ver órdenes que contienen sus productos
   */
  private canUserAccessOrder(order: Order, user: User): boolean {
    // Admin puede ver todo
    if (user.role === 'admin') {
      return true;
    }

    // Buyer puede ver sus propias órdenes
    if (order.buyer.id === user.id) {
      return true;
    }

    // Seller puede ver órdenes que contienen sus productos
    if (this.isUserSellerOfOrder(order, user)) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si un usuario es seller de algún producto en la orden
   * Un 'user' puede ser buyer Y seller simultáneamente
   */
  private isUserSellerOfOrder(order: Order, user: User): boolean {
    return order.items.some((item) => item.product.seller.id === user.id);
  }

  /**
   * Valida que una transición de estado sea válida
   * Reglas:
   * - pending → accepted, canceled
   * - accepted → delivered, canceled
   * - delivered → (ninguno, estado final)
   * - canceled → (ninguno, estado final)
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions: Record<string, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELED],
      [OrderStatus.ACCEPTED]: [OrderStatus.DELIVERED, OrderStatus.CANCELED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus as OrderStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedStatuses.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Manejo centralizado de excepciones
   * Patrón usado por el equipo en Products
   */
  private handleException(error: any): never {
    // Si es una excepción conocida, la re-lanzamos
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }

    // Si es un error desconocido, lo logueamos y lanzamos error genérico
    console.error('Unexpected error in OrdersService:', error);
    throw new InternalServerErrorException(
      'Unexpected error occurred. Please check server logs',
    );
  }

  /**
   * Contar número de órdenes (para seeds)
   */
  async count(): Promise<number> {
    return await this.orderRepository.count();
  }
}