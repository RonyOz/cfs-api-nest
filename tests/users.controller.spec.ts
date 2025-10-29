import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { UsersController } from '../src/modules/users/users.controller';
import { UsersService } from '../src/modules/users/users.service';
import { INestApplication } from '@nestjs/common';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let usersService = { create: jest.fn(), findAll: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: usersService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/users (GET) - Happy Path', async () => {
        usersService.findAll.mockResolvedValue([{ id: 1, name: 'User A' }]);

        const response = await request(app.getHttpServer()).get('/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: 'User A' }]);
    });

    it('/users (GET) - Error Path', async () => {
        usersService.findAll.mockRejectedValue(new Error('Database error'));

        const response = await request(app.getHttpServer()).get('/users');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });
});