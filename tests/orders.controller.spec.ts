import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { OrdersController } from '../src/modules/orders/orders.controller';
import { OrdersService } from '../src/modules/orders/orders.service';
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

    describe('/orders (GET)', () => {
        it('should return all orders successfully', async () => {
            const mockOrders = [
                {
                    id: '1',
                    total: 100,
                    createdAt: '2025-01-01T00:00:00Z',
                    buyer: { id: '1', email: 'buyer@example.com' },
                    items: []
                },
                {
                    id: '2',
                    total: 200,
                    createdAt: '2025-01-02T00:00:00Z',
                    buyer: { id: '2', email: 'buyer2@example.com' },
                    items: []
                }
            ];

            ordersService.findAll.mockResolvedValue(mockOrders);

            const response = await request(app.getHttpServer()).get('/orders');

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual(mockOrders);
            expect(response.body).toHaveLength(2);
        });

        it('should return 500 when database error occurs', async () => {
            ordersService.findAll.mockRejectedValue(new Error('Database connection failed'));

            const response = await request(app.getHttpServer()).get('/orders');

            expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});