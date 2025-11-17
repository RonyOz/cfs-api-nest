import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UploadUrlResponse {
  @Field({ description: 'Temporary signed URL for uploading the file' })
  uploadUrl: string;

  @Field({ description: 'Authentication token for the upload' })
  token: string;

  @Field({ description: 'Path where the file will be stored in the bucket' })
  path: string;

  @Field({ description: 'Public URL that will be accessible after upload' })
  publicUrl: string;
}
