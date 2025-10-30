import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';


/**
 * DTO para crear una nueva orden
 * El buyer se obtiene automáticamente del token JWT (@GetUser)
 * El total se calcula automáticamente en el servicio
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de items a incluir en la orden',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 1,
      },
    ],
  })
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}