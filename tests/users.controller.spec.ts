import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UsersController } from '../src/modules/users/users.controller';
import { UsersService } from '../src/modules/users/users.service';
import { INestApplication, HttpStatus, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let usersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: usersService,
                },
            ],
        })
            .overrideGuard(AuthGuard())
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/users/:id (GET)', () => {
        it('should return a user by id successfully', async () => {
            const mockUser = {
                id: '123',
                email: 'user@example.com',
                username: 'testuser',
                fullName: 'Test User',
                role: 'user'
            };

            usersService.findOne.mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer()).get('/users/123');

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual(mockUser);
            expect(response.body.email).toBe('user@example.com');
        });

        it('should return 404 when user not found', async () => {
            usersService.findOne.mockRejectedValue(
                new NotFoundException('User not found')
            );

            const response = await request(app.getHttpServer()).get('/users/999');

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });
});