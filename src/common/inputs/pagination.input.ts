import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class PaginationInput {
    @Field(() => Int, { nullable: true, defaultValue: 10 })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number = 10;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number = 0;
}
