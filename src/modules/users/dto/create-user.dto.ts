import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ValidRoles } from '../../auth/enums/roles.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;


  @IsEmail()
  email: string;


  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(ValidRoles)
  role?: string;
}
