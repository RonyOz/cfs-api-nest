import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { SellerController } from './seller.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule
  ],

  controllers: [UsersController, SellerController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule { }
