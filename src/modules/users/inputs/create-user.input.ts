import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ValidRoles } from '../../auth/enums/roles.enum';

@InputType()
export class CreateUserInput {
    @Field()
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

    @Field(() => ValidRoles, { nullable: true })
    @IsEnum(ValidRoles)
    @IsOptional()
    role?: ValidRoles;
}
