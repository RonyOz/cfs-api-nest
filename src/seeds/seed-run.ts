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
    // eslint-disable-next-line no-console
    console.log('Application context created');

    // watchdog to detect long-running/hung seed
    const watchdog = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.warn('Seed appears to be hanging (no progress in 60s).');
    }, 60000);

    try {
        // eslint-disable-next-line no-console
        console.log('Retrieving SeedService from context...');
        const seedService = appCtx.get(SeedService);
        // eslint-disable-next-line no-console
        console.log('Starting seed.run()...');
        const result = await seedService.run();
        clearTimeout(watchdog);
        // eslint-disable-next-line no-console
        console.log('Seed finished:', result);
    } catch (error) {
        clearTimeout(watchdog);
        // eslint-disable-next-line no-console
        console.error('Seed failed:', error && error.stack ? error.stack : error);
        process.exitCode = 1;
    } finally {
        await appCtx.close();
    }
}

bootstrap();
