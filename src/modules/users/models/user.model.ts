import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ProductModel } from '../../products/models/product.model';

@ObjectType('User')
export class UserModel {
    @Field(() => ID)
    id: string;

    @Field()
    email: string;

    @Field()
    username: string;

    @Field()
    role: string;

    @Field()
    twoFactorEnabled: boolean;

    @Field(() => [ProductModel], { nullable: true })
    products?: ProductModel[];

    @Field(() => Int, { nullable: true })
    productsCount?: number;
}
