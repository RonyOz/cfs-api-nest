import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UploadUrlResponse } from './models/upload-url-response.model';
import { CreateUploadUrlInput } from './inputs/create-upload-url.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver()
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Mutation(() => UploadUrlResponse, {
    name: 'createUploadUrl',
    description: 'Generate a signed URL for uploading product images to Supabase Storage',
  })
  @UseGuards(GqlAuthGuard)
  async createUploadUrl(
    @Args('input') input: CreateUploadUrlInput,
  ): Promise<UploadUrlResponse> {
    return this.storageService.createSignedUploadUrl(input.fileName);
  }
}
