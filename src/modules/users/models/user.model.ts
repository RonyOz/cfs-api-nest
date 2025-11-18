import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { ProductModel } from '../../products/models/product.model';
import { ValidRoles } from '../../auth/enums/roles.enum';

@ObjectType('SalesHistoryItem')
export class SalesHistoryItemModel {
  @Field(() => ID)
  orderItemId: string;

  @Field(() => ID)
  productId: string;

  @Field()
  productName: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  itemPrice: number;
}

@ObjectType('SalesHistory')
export class SalesHistoryModel {
  @Field(() => ID)
  id: string;

  @Field()
  status: string;

  @Field(() => Float)
  total: number;

  @Field()
  createdAt: Date;

  @Field(() => [SalesHistoryItemModel])
  items: SalesHistoryItemModel[];
}

@ObjectType('User')
export class UserModel {
    @Field(() => ID)
    id: string;

    @Field()
    email: string;

    @Field()
    username: string;

    @Field({ nullable: true })
    phoneNumber?: string;

    @Field(() => ValidRoles)
    role: ValidRoles;

    @Field()
    twoFactorEnabled: boolean;

    @Field(() => [ProductModel], { nullable: true })
    products?: ProductModel[];

    @Field(() => Int, { nullable: true })
    productsCount?: number;

    @Field(() => Int, { nullable: true, description: 'Total number of orders where this seller has sold products' })
    totalOrders?: number;

    @Field(() => Int, { nullable: true, description: 'Number of orders this month where this seller has sold products' })
    ordersThisMonth?: number;

    @Field(() => [SalesHistoryModel], { nullable: true, description: 'Sales history with order details' })
    salesHistory?: SalesHistoryModel[];
}
