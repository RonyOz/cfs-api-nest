import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateProductInput {
    @Field()
    @IsString()
    @MinLength(3, { message: 'Product name must be at least 3 characters long' })
    name: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    description?: string;

    @Field(() => Float)
    @IsNumber()
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    @Type(() => Number)
    price: number;

    @Field(() => Int, { nullable: true })
    @IsNumber()
    @Min(0, { message: 'Stock must be greater than or equal to 0' })
    @Type(() => Number)
    @IsOptional()
    stock?: number;
}
