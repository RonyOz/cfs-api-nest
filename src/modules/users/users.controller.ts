import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async findAll() {
    // TODO: enforce admin role and return users
    return [];
  }

  @Post()
  @Auth('admin')
  @ApiOperation({ summary: 'Create a user (admin only)' })
  async create(@Body() dto: CreateUserDto) {
    // TODO: call usersService.create
    return { message: 'User created', user: 'TODO' };
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string) {
    // TODO: return user by id
    return { user: 'TODO' };
  }

  @Put(':id')
  @Auth()
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    // TODO: update user
    return { user: 'TODO' };
  }

  @Delete(':id')
  @Auth('admin')
  async remove(@Param('id') id: string) {
    // TODO: delete user
    return { message: 'Deleted' };
  }
}
