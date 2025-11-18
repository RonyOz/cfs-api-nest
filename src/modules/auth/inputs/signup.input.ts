import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
    @Field(() => String)
    @IsEmail()
    email: string;

    @Field()
    @IsString()
    @MinLength(3)
    username: string;

    @Field()
    @IsString()
    @MinLength(6)
    password: string;

    @Field()
    @IsString()
    phoneNumber: string;
}
