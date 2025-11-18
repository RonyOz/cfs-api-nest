import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ValidRoles } from '../../auth/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'The password of the user',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
    enum: ValidRoles,
    default: ValidRoles.user,
    required: false,
  })
  @IsOptional()
  @IsEnum(ValidRoles)
  role?: ValidRoles;
}
