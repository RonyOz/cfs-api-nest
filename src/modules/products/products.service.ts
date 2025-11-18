import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './dto/pagination.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, offset } = paginationDto;
      return await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: ['seller'],
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(term: string) {
    const product = await this.productRepository.findOne({
      where: isUUID(term) ? { id: term } : { name: term },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }

    return product;
  }

  async findByUser(userId: string, paginationDto: PaginationDto) {
    try {
      const { limit, offset } = paginationDto;
      return await this.productRepository.find({
        where: { seller: { id: userId } },
        take: limit,
        skip: offset,
        relations: ['seller'],
      });
    } catch (error) {
      this.handleException(error);
    }
  }

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const product = this.productRepository.create({
        ...createProductDto,
        seller: user,
      });

      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleException(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // First check ownership
    const existingProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Check if user is the owner or admin
    if (existingProduct.seller.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own products');
    }

    try {
      // preload busca la entidad y prepara los cambios
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      await this.productRepository.save(product);
      return this.findOne(id);
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string, user: User) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['seller'],// se coloca eso para que pueda validar la propiedad seller
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    // Check if user is the owner or admin
    if (product.seller.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own products');
    }

    try {
      await this.productRepository.remove(product);
    } catch (error) {
      this.handleException(error);
    }
  }

  private handleException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
