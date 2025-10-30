import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Estados posibles de una orden
 * - pending: Orden creada, esperando confirmación del vendedor
 * - accepted: Vendedor aceptó la orden
 * - delivered: Orden entregada al comprador
 * - canceled: Orden cancelada (por buyer o seller)
 */
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

/**
 * DTO para actualizar el estado de una orden
 * Solo sellers de productos en la orden o admins pueden usar este endpoint
 */
export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la orden',
    enum: OrderStatus,
    example: OrderStatus.ACCEPTED,
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: pending, accepted, delivered, canceled',
  })
  status: OrderStatus;
}