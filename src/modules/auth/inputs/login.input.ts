import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, IsOptional } from 'class-validator';

@InputType()
export class LoginInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    password: string;

    @Field({ nullable: true })
    @IsString()
    @IsOptional()
    token?: string;
}
