import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { OrdersController } from '../../src/modules/orders/orders.controller';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { INestApplication, HttpStatus } from '@nestjs/common';

describe('OrdersController (e2e)', () => {
    let app: INestApplication;
    let ordersService = {
        create: jest.fn(),
        findAll: jest.fn()
    };

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



    it('should return 500 when database error occurs', async () => {
        ordersService.findAll.mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app.getHttpServer()).get('/orders');

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

});