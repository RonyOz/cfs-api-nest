import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { OrdersController } from '../src/modules/orders/orders.controller';
import { OrdersService } from '../src/modules/orders/orders.service';
import { INestApplication } from '@nestjs/common';

describe('OrdersController (e2e)', () => {
    let app: INestApplication;
    let ordersService = { create: jest.fn(), findAll: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [
                {
                    provide: OrdersService,
                    useValue: ordersService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/orders (GET) - Happy Path', async () => {
        ordersService.findAll.mockResolvedValue([{ id: 1, total: 100 }]);

        const response = await request(app.getHttpServer()).get('/orders');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, total: 100 }]);
    });

    it('/orders (GET) - Error Path', async () => {
        ordersService.findAll.mockRejectedValue(new Error('Database error'));

        const response = await request(app.getHttpServer()).get('/orders');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });
});