import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Generate signed upload URL for product image',
    description: 'Returns a signed URL that the frontend can use to upload an image directly to Supabase Storage',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Signed upload URL created successfully',
    schema: {
      example: {
        uploadUrl: 'https://xxx.supabase.co/storage/v1/object/upload/sign/product-images/products/...',
        token: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        path: 'products/1234567890-product-image.jpg',
        publicUrl: 'https://xxx.supabase.co/storage/v1/object/public/product-images/products/1234567890-product-image.jpg',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file name' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createUploadUrl(@Body() createUploadUrlDto: CreateUploadUrlDto) {
    return this.storageService.createSignedUploadUrl(createUploadUrlDto.fileName);
  }
}
