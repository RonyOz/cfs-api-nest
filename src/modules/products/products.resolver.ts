import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductModel } from './models/product.model';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { PaginationInput } from '../../common/inputs/pagination.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => ProductModel)
export class ProductsResolver {
    constructor(private readonly productsService: ProductsService) { }

    @Query(() => [ProductModel], { name: 'products' })
    async getProducts(
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Product[]> {
        const paginationDto = pagination || { limit: 10, offset: 0 };
        const products = await this.productsService.findAll(paginationDto);
        return products || [];
    }

    @Query(() => ProductModel, { name: 'product' })
    async getProduct(@Args('term') term: string): Promise<Product> {
        return this.productsService.findOne(term);
    }

    @Query(() => [ProductModel], { name: 'myProducts' })
    @UseGuards(GqlAuthGuard)
    async getMyProducts(
        @GetUser() user: User,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    ): Promise<Product[]> {
        const products = await this.productsService.findByUser(user.id, pagination || { limit: 10, offset: 0 });
        return products || [];
    }

    @Mutation(() => ProductModel, { name: 'createProduct' })
    @UseGuards(GqlAuthGuard)
    async createProduct(
        @Args('input') input: CreateProductInput,
        @GetUser() user: User,
    ): Promise<Product> {
        const product = await this.productsService.create(input, user);
        return product!;
    }

    @Mutation(() => ProductModel, { name: 'updateProduct' })
    @UseGuards(GqlAuthGuard)
    async updateProduct(
        @Args('id') id: string,
        @Args('input') input: UpdateProductInput,
        @GetUser() user: User,
    ): Promise<Product> {
        const product = await this.productsService.update(id, input, user);
        return product!;
    }

    @Mutation(() => Boolean, { name: 'deleteProduct' })
    @UseGuards(GqlAuthGuard)
    async deleteProduct(
        @Args('id') id: string,
        @GetUser() user: User,
    ): Promise<boolean> {
        await this.productsService.remove(id, user);
        return true;
    }
}
