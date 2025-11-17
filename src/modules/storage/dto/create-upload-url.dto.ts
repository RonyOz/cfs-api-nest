import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class CreateUploadUrlDto {
  @ApiProperty({
    example: 'product-image.jpg',
    description: 'Name of the file to upload (must be an image)',
  })
  @IsString()
  @MinLength(1)
  @Matches(/\.(jpg|jpeg|png|gif|webp)$/i, {
    message: 'File name must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)',
  })
  fileName: string;
}
