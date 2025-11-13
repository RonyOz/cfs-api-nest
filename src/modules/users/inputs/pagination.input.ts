import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, Min } from 'class-validator';

@InputType()
export class PaginationInput {
    @Field(() => Int, { nullable: true, defaultValue: 10 })
    @IsOptional()
    @IsPositive()
    limit?: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @Min(0)
    offset?: number;
}
