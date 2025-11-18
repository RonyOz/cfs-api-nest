import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { isUUID } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ValidRoles } from '../auth/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, offset } = paginationDto;
      const users = await this.userRepository.find({
        take: limit,
        skip: offset,
      });

      return users.map((user) => this.toSafeUser(user));
    } catch (error) {
      this.handleException(error);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, role = ValidRoles.user, ...userDetails } = createUserDto;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...userDetails,
        password: hashedPassword,
        role,
      });

      await this.userRepository.save(user);

      return this.toSafeUser(user);
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(term: string, viewer?: User) {
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = isUUID(term)
      ? { id: term }
      : [{ email: term }, { username: term }];

    const user = await this.userRepository.findOne({
      where,
      relations: ['products', 'orders'],
    });

    if (!user) {
      const identifier = isUUID(term) ? `id ${term}` : term;
      throw new NotFoundException(`User with ${identifier} not found`);
    }

    const safeUser = this.toSafeUser(user, viewer);
    return {
      ...safeUser,
      products: user.products ?? [],
      orders: user.orders ?? [],
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, viewer?: User) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    try {
      const { password, username, email, role, phoneNumber } = updateUserDto;

      if (username !== undefined) {
        user.username = username;
      }

      if (email !== undefined) {
        user.email = email;
      }

      if (role !== undefined) {
        user.role = role;
      }

      if (phoneNumber !== undefined) {
        user.phoneNumber = phoneNumber;
      }

      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await this.userRepository.save(user);
      return this.findOne(id, viewer);
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    try {
      await this.userRepository.remove(user);
    } catch (error) {
      this.handleException(error);
    }
  }

  // Method used by auth service to find user with password
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  private handleException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }
    
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
  
  async findAllSellers(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      // Usamos query builder para traer usuario + count de productos
      const qb = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.products', 'product')
        .loadRelationCountAndMap('user.productsCount', 'user.products')
        .where('product.id IS NOT NULL') // solo usuarios con productos
        .take(limit)
        .skip(offset)
        .orderBy('user.username', 'ASC');

      const sellers = await qb.getMany();

      return sellers.map((u) => {
        const safeUser = this.toSafeUser(u as User);
        return {
          ...safeUser,
          products: (u as any).products?.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
          })) ?? [],
          productsCount: (u as any).productsCount ?? 0,
        };
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Perfil público de un vendedor:
   * - Datos públicos del usuario (incluyendo phoneNumber)
   * - Productos con información completa
   * - Conteo de productos
   * - Estadísticas de órdenes (total y del mes actual)
   * - Historial de ventas (salesHistory) con detalles de cada orden
   *
   * Nota: Información pública completa para mostrar en perfil de vendedor.
   */
  async findSellerProfile(id: string) {
    // Validación básica
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    // Buscar usuario con sus productos
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!user) return null;

    try {
      // Calcular estadísticas de órdenes
      // Contamos las órdenes donde este vendedor tiene productos
      const ordersQuery = this.userRepository.manager
        .createQueryBuilder()
        .select('DISTINCT o.id')
        .from('orders', 'o')
        .innerJoin('order_items', 'oi', 'oi."orderId" = o.id')
        .innerJoin('products', 'p', 'p.id = oi."productId"')
        .where('p."sellerId" = :sellerId', { sellerId: id });

      const totalOrdersResult = await ordersQuery.getRawMany();
      const totalOrders = totalOrdersResult.length;

      // Órdenes del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersThisMonthQuery = this.userRepository.manager
        .createQueryBuilder()
        .select('DISTINCT o.id')
        .from('orders', 'o')
        .innerJoin('order_items', 'oi', 'oi."orderId" = o.id')
        .innerJoin('products', 'p', 'p.id = oi."productId"')
        .where('p."sellerId" = :sellerId', { sellerId: id })
        .andWhere('o.createdAt >= :startOfMonth', { startOfMonth });

      const ordersThisMonthResult = await ordersThisMonthQuery.getRawMany();
      const ordersThisMonth = ordersThisMonthResult.length;

      // Obtener historial de ventas con detalles
      // Usando las relaciones de TypeORM en lugar de raw SQL
      const productIds = (user.products ?? []).map((p) => p.id);

      let salesHistory: any[] = [];

      if (productIds.length > 0) {
        const salesHistoryQuery = await this.userRepository.manager
          .createQueryBuilder()
          .select('o.id', 'orderId')
          .addSelect('o.status', 'orderStatus')
          .addSelect('o.total', 'orderTotal')
          .addSelect('o.createdAt', 'orderCreatedAt')
          .addSelect('oi.id', 'orderItemId')
          .addSelect('oi.quantity', 'itemQuantity')
          .addSelect('oi.price', 'itemPrice')
          .addSelect('p.id', 'productId')
          .addSelect('p.name', 'productName')
          .from('orders', 'o')
          .innerJoin('order_items', 'oi', 'oi."orderId" = o.id')
          .innerJoin('products', 'p', 'p.id = oi."productId"')
          .where('p.id IN (:...productIds)', { productIds })
          .orderBy('o.createdAt', 'DESC')
          .getRawMany();

        // Agrupar items por orden
        const ordersMap = new Map();
        salesHistoryQuery.forEach((row) => {
          if (!ordersMap.has(row.orderId)) {
            ordersMap.set(row.orderId, {
              id: row.orderId,
              status: row.orderStatus,
              total: Number(row.orderTotal),
              createdAt: row.orderCreatedAt,
              items: [],
            });
          }
          ordersMap.get(row.orderId).items.push({
            orderItemId: row.orderItemId,
            productId: row.productId,
            productName: row.productName,
            quantity: Number(row.itemQuantity),
            itemPrice: Number(row.itemPrice),
          });
        });

        salesHistory = Array.from(ordersMap.values());
      }

      // Respuesta pública (omitimos solo password y twoFactorSecret)
      const { password, twoFactorSecret, ...publicUser } = user as any;

      return {
        id: publicUser.id,
        username: publicUser.username,
        email: publicUser.email,
        phoneNumber: publicUser.phoneNumber,
        role: publicUser.role,
        twoFactorEnabled: publicUser.twoFactorEnabled,
        products: (user.products ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
        })),
        productsCount: user.products?.length ?? 0,
        totalOrders,
        ordersThisMonth,
        salesHistory, // ✨ Historial completo de ventas
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  private toSafeUser(user: User, viewer?: User) {
    if (!user) {
      return null;
    }

    const { password, twoFactorSecret, ...rest } = user as any;
    const safeUser: any = { ...rest };

    if (!viewer || (viewer.id !== user.id && viewer.role !== 'admin')) {
      delete safeUser.phoneNumber;
    }


    return safeUser;
  }
}



