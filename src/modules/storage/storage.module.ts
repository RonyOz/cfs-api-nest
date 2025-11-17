import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { StorageResolver } from './storage.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, StorageResolver],
  exports: [StorageService],
})
export class StorageModule {}
