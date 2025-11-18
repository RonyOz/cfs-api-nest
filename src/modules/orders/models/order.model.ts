import { ObjectType, Field, ID, Float, GraphQLISODateTime, Int } from '@nestjs/graphql';
import { ProductModel } from '../../products/models/product.model';

@ObjectType('OrderItem')
export class OrderItemModel {
  @Field(() => ID)
  id: string;

  @Field(() => ProductModel)
  product: ProductModel;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}

@ObjectType('Order')
export class OrderModel {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  total: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;

  @Field(() => String)
  status: string;

  @Field(() => [OrderItemModel])
  items: OrderItemModel[];
}
