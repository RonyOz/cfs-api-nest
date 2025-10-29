import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { INestApplication } from '@nestjs/common';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let authService = { login: jest.fn(), signup: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/login (POST) - Happy Path', async () => {
        authService.login.mockResolvedValue({ accessToken: 'test-token' });

        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'test', password: 'test' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ accessToken: 'test-token' });
    });

    it('/auth/login (POST) - Error Path', async () => {
        authService.login.mockRejectedValue(new Error('Invalid credentials'));

        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ username: 'test', password: 'wrong-password' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid credentials');
    });
});