import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cada item individual de una orden
 * Se usa dentro de CreateOrderDto como array anidado
 */
export class CreateOrderItemDto {
  @ApiProperty({
    description: 'UUID del producto a comprar',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    description: 'Cantidad de unidades a comprar',
    example: 2,
    minimum: 1,
    type: Number,
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}