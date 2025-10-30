// src/modules/users/seller.controller.ts
import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('Sellers')
@Controller('seller')
export class SellerController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all sellers (public)' })
  @ApiResponse({ status: 200, description: 'List of sellers retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAllSellers(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public seller profile by id (public) — includes products and sales history' })
  @ApiResponse({ status: 200, description: 'Seller profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  async findOne(@Param('id') id: string) {
    const profile = await this.usersService.findSellerProfile(id.trim());
    if (!profile) throw new NotFoundException(`Seller with id ${id} not found`);
    return profile;
  }
}
