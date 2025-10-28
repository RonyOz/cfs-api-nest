import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2FADto {
  @ApiProperty({ example: '123456', description: 'Six-digit TOTP code' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
