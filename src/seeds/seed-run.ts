import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

@Module({
    imports: [AppModule, SeedModule],
})
class SeedRunnerModule { }

async function bootstrap() {
    const appCtx = await NestFactory.createApplicationContext(SeedRunnerModule);
    try {
        const seedService = appCtx.get(SeedService);
        const result = await seedService.run();
        // eslint-disable-next-line no-console
        console.log('Seed finished:', result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Seed failed:', error);
        process.exitCode = 1;
    } finally {
        await appCtx.close();
    }
}

bootstrap();
