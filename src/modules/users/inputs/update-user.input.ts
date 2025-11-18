import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ValidRoles } from '../../auth/enums/roles.enum';

@InputType()
export class UpdateUserInput {
    @Field({ nullable: true })
    @IsEmail()
    @IsOptional()
    email?: string;

    @Field({ nullable: true })
    @IsString()
    @MinLength(3)
    @IsOptional()
    username?: string;

    @Field({ nullable: true })
    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @Field(() => ValidRoles, { nullable: true })
    @IsEnum(ValidRoles)
    @IsOptional()
    role?: ValidRoles;
}
