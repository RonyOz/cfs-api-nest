import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ProductsController } from '../src/modules/products/products.controller';
import { ProductsService } from '../src/modules/products/products.service';
import { INestApplication } from '@nestjs/common';

describe('ProductsController (e2e)', () => {
    let app: INestApplication;
    let productsService = { create: jest.fn(), findAll: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: productsService,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/products (GET) - Happy Path', async () => {
        productsService.findAll.mockResolvedValue([{ id: 1, name: 'Product A' }]);

        const response = await request(app.getHttpServer()).get('/products');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: 'Product A' }]);
    });

    it('/products (GET) - Error Path', async () => {
        productsService.findAll.mockRejectedValue(new Error('Database error'));

        const response = await request(app.getHttpServer()).get('/products');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });
});