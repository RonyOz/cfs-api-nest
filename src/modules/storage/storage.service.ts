import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient | null = null;
  private readonly bucketName = 'product-images';
  private readonly supabaseUrl?: string;
  private readonly supabaseKey?: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (this.supabaseUrl && this.supabaseKey) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }
  }

  private getClient(): SupabaseClient {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new InternalServerErrorException(
        'Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      );
    }

    if (!this.supabase) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }

    return this.supabase;
  }

  async createSignedUploadUrl(fileName: string): Promise<{
    uploadUrl: string;
    token: string;
    path: string;
    publicUrl: string;
  }> {
    try {
      // Generate unique path with timestamp to avoid collisions
      const timestamp = Date.now();
      const path = `products/${timestamp}-${fileName}`;

      // Create signed upload URL
      const supabase = this.getClient();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUploadUrl(path);

      if (error) {
        throw new InternalServerErrorException(`Failed to create upload URL: ${error.message}`);
      }

      // Get public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(path);

      return {
        uploadUrl: data.signedUrl,
        token: data.token,
        path: path,
        publicUrl: publicUrlData.publicUrl,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Unexpected error creating upload URL');
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Unexpected error deleting file');
    }
  }

  extractPathFromUrl(url: string): string | null {
    try {
      // Extract path from Supabase public URL
      // Format: https://xxx.supabase.co/storage/v1/object/public/product-images/products/...
      const match = url.match(/\/product-images\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
