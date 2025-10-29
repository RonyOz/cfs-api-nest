import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ProductsController } from '../src/modules/products/products.controller';
import { ProductsService } from '../src/modules/products/products.service';
import { INestApplication, HttpStatus } from '@nestjs/common';

describe('ProductsController (e2e)', () => {
    let app: INestApplication;
    let productsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
    };

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

    describe('/products (GET)', () => {
        it('should return all products successfully', async () => {
            const mockProducts = [
                {
                    id: '1',
                    name: 'Product A',
                    description: 'Description A',
                    price: 10.99,
                    stock: 100
                },
                {
                    id: '2',
                    name: 'Product B',
                    description: 'Description B',
                    price: 20.99,
                    stock: 50
                }
            ];

            productsService.findAll.mockResolvedValue(mockProducts);

            const response = await request(app.getHttpServer()).get('/products');

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual(mockProducts);
            expect(response.body).toHaveLength(2);
        });

        it('should return 500 when database error occurs', async () => {
            productsService.findAll.mockRejectedValue(new Error('Database connection failed'));

            const response = await request(app.getHttpServer()).get('/products');

            expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});