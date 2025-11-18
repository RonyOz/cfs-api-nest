import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username for the new account',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address for the new account',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'Password for the new account',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number for contact between buyers and sellers',
  })
  @IsString()
  phoneNumber: string;
}
