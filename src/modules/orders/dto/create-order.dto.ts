import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  notes?: string;
}
