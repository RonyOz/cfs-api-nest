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

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(term: string) {
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

    const { password, products, orders, ...safeUser } = user;
    return {
      ...safeUser,
      products: products ?? [],
      orders: orders ?? [],
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    try {
      const { password, username, email, role } = updateUserDto;

      if (username !== undefined) {
        user.username = username;
      }

      if (email !== undefined) {
        user.email = email;
      }

      if (role !== undefined) {
        user.role = role;
      }

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
   * - Datos públicos del usuario (sin password)
   * - Productos con información completa
   * - Conteo de productos
   *
   * Nota: se retorna información pública solamente compatible con UserModel.
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
      // Respuesta pública (omitimos password y twoFactorSecret)
      const { password, twoFactorSecret, ...publicUser } = user as any;

      return {
        id: publicUser.id,
        username: publicUser.username,
        email: publicUser.email,
        role: publicUser.role,
        twoFactorEnabled: publicUser.twoFactorEnabled,
        products: (user.products ?? []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
        })),
        productsCount: user.products?.length ?? 0,
      };
    } catch (error) {
      this.handleException(error);
    }
  }

}
