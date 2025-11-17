import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'Product name',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Latest iPhone with A17 Pro chip',
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Available stock',
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  stock?: number;

  @ApiProperty({
    example: 'https://xxx.supabase.co/storage/v1/object/public/product-images/products/1234567890-image.jpg',
    description: 'Product image URL from Supabase Storage',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
