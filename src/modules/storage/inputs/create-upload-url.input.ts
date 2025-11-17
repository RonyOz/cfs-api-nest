import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, Matches } from 'class-validator';

@InputType()
export class CreateUploadUrlInput {
  @Field({ description: 'Name of the file to upload (must be an image)' })
  @IsString()
  @MinLength(1)
  @Matches(/\.(jpg|jpeg|png|gif|webp)$/i, {
    message: 'File name must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)',
  })
  fileName: string;
}
