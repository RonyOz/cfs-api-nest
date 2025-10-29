import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Auth } from 'src/modules/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/modules/auth/enums/roles.enum';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @Post('run')
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: 'Run database seed (creates admin and example products)' })
  async run() {
    return this.seedService.run();
  }
}
