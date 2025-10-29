import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { INestApplication, HttpStatus, UnauthorizedException } from '@nestjs/common';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let authService = {
        login: jest.fn(),
        signup: jest.fn()
    };

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

    describe('/auth/login (POST)', () => {
        it('should return token on successful login', async () => {
            authService.login.mockResolvedValue({
                message: 'Login successful',
                token: 'test-jwt-token'
            });

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).toBe('test-jwt-token');
        });

        it('should return 401 on invalid credentials', async () => {
            authService.login.mockRejectedValue(
                new UnauthorizedException('Invalid credentials')
            );

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'wrong-password' });

            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('/auth/signup (POST)', () => {
        it('should create a new user and return token', async () => {
            authService.signup.mockResolvedValue({
                message: 'Signup successful',
                token: 'test-jwt-token'
            });

            const response = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123',
                    username: 'newuser',
                    fullName: 'New User'
                });

            expect(response.status).toBe(HttpStatus.CREATED);
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).toBe('test-jwt-token');
        });

        it('should return 409 when user already exists', async () => {
            authService.signup.mockRejectedValue(
                new Error('User already exists')
            );

            const response = await request(app.getHttpServer())
                .post('/auth/signup')
                .send({
                    email: 'existing@example.com',
                    password: 'password123',
                    username: 'existing',
                    fullName: 'Existing User'
                });

            expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});