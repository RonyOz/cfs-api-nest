import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

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
}
