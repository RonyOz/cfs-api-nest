import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { PaginationInput } from '../../common/inputs/pagination.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { GqlRolesGuard } from '../auth/guards/gql-roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => UserModel)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @Query(() => [UserModel], {
        name: 'users',
        description: 'Get all users with pagination',
    })
    @UseGuards(GqlAuthGuard, GqlRolesGuard)
    @Roles('admin')
    async findAll(
        @Args('pagination', { nullable: true }) paginationInput?: PaginationInput,
    ): Promise<any[]> {
        const pagination = paginationInput || { limit: 10, offset: 0 };
        return this.usersService.findAll(pagination) as any;
    }

    @Query(() => UserModel, {
        name: 'user',
        description: 'Get a single user by ID, email, or username',
    })
    @UseGuards(GqlAuthGuard)
    async findOne(
        @Args('term') term: string,
    ): Promise<any> {
        return this.usersService.findOne(term) as any;
    }

    @Query(() => [UserModel], {
        name: 'sellers',
        description: 'Get all sellers (users with products)',
    })
    async findAllSellers(
        @Args('pagination', { nullable: true }) paginationInput?: PaginationInput,
    ): Promise<any[]> {
        const pagination = paginationInput || { limit: 10, offset: 0 };
        return this.usersService.findAllSellers(pagination) as any;
    }

    @Query(() => UserModel, {
        name: 'sellerProfile',
        description: 'Get public seller profile with products and sales history',
        nullable: true,
    })
    async findSellerProfile(
        @Args('id') id: string,
    ): Promise<any> {
        return this.usersService.findSellerProfile(id);
    }

    @Mutation(() => UserModel, {
        description: 'Create a new user (admin only)',
    })
    @UseGuards(GqlAuthGuard, GqlRolesGuard)
    @Roles('admin')
    async createUser(
        @Args('input') createUserInput: CreateUserInput,
    ): Promise<any> {
        return this.usersService.create(createUserInput) as any;
    }

    @Mutation(() => UserModel, {
        description: 'Update an existing user (admin only)',
    })
    @UseGuards(GqlAuthGuard, GqlRolesGuard)
    @Roles('admin')
    async updateUser(
        @Args('id') id: string,
        @Args('input') updateUserInput: UpdateUserInput,
    ): Promise<any> {
        return this.usersService.update(id, updateUserInput) as any;
    }

    @Mutation(() => Boolean, {
        description: 'Delete a user (admin only)',
    })
    @UseGuards(GqlAuthGuard, GqlRolesGuard)
    @Roles('admin')
    async removeUser(
        @Args('id') id: string,
    ): Promise<boolean> {
        await this.usersService.remove(id);
        return true;
    }
}
