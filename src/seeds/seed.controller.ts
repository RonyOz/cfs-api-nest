import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run database seed (creates admin and example products)' })
  async run() {
    // NOTE: this endpoint should be protected in production
    return this.seedService.run();
  }
}
