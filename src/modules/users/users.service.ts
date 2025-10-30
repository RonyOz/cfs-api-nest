import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';

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

      // Remove password from response
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, role = 'user', ...userDetails } = createUserDto;

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

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(term: string) {
    const user = await this.userRepository.findOne({
      where: isUUID(term) 
        ? { id: term }
        : [{ email: term }, { username: term }]
    });

    if (!user) {
      throw new NotFoundException(`User with ${term} not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userDetails } = updateUserDto;

    const user = await this.userRepository.preload({
      id: id,
      ...userDetails,
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    try {
      // If password is being updated, hash it
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await this.userRepository.save(user);
      return this.findOne(id);
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.remove(user);
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

      return sellers.map(u => {
        const { password, ...rest } = u as any;
        return {
          ...rest,
          products: (u as any).products?.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock
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
   * - Datos públicos del usuario (sin password, sin email si quieres privacidad)
   * - Productos (lista resumida)
   * - Historial de ventas: orders que incluyen productos del seller, con totales por orderItem
   *
   * Nota: se retorna información pública solamente.
   */
  async findSellerProfile(id: string) {
    // Validación básica
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    // 1) Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!user) return null;

    try {
      // 2) Historial de ventas: orders que contienen productos de este seller.
      // Necesitamos acceder a Order / OrderItem; usamos QueryBuilder genérico.

      const salesQb = this.userRepository.manager.createQueryBuilder()
        .select([
          'o.id AS orderId',
          'o.status AS orderStatus',
          'o.createdAt AS orderCreatedAt',
          'oi.id AS orderItemId',
          'oi.quantity AS quantity',
          'oi.price AS itemPrice',
          'p.id AS productId',
          'p.name AS productName'
        ])
        .from('orders', 'o')
        .innerJoin('order_items', 'oi', 'oi.orderId = o.id')
        .innerJoin('products', 'p', 'p.id = oi.productId')
        .where('p.sellerId = :sellerId', { sellerId: id })
        .orderBy('o.createdAt', 'DESC');

      const rawSales = await salesQb.execute();

      // Mapear rawSales a estructura agrupada por order
      const salesMap = new Map<string, any>();
      for (const row of rawSales) {
        const orderId = row.orderid;
        if (!salesMap.has(orderId)) {
          salesMap.set(orderId, {
            id: orderId,
            status: row.orderstatus,
            createdAt: row.ordercreatedat,
            items: []
          });
        }
        salesMap.get(orderId).items.push({
          orderItemId: row.orderitemid,
          productId: row.productid,
          productName: row.productname,
          quantity: Number(row.quantity),
          itemPrice: Number(row.itemprice),
        });
      }

      const sales = Array.from(salesMap.values());

      // Respuesta pública (omitimos password)
      const { password, email, twoFactorSecret, ...publicUser } = user as any;

      return {
        seller: {
          id: publicUser.id,
          username: publicUser.username,
          // si quieres exponer email, quítalo de aquí
          // email: publicUser.email,
          twoFactorEnabled: publicUser.twoFactorEnabled,
        },
        products: (user.products ?? []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
        })),
        salesHistory: sales,
      };
    } catch (error) {
      this.handleException(error);
    }
  }

}
