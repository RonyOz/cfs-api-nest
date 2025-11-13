import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

@ObjectType('Product')
export class ProductModel {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => Float)
    price: number;

    @Field(() => Int)
    stock: number;

    @Field(() => UserModel)
    seller: UserModel;
}
