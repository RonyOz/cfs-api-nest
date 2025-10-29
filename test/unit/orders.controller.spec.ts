import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/modules/orders/orders.controller';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { CreateOrderDto } from '../../src/modules/orders/dto/create-order.dto';

describe('OrdersController', () => {
    let controller: OrdersController;
    let ordersService: jest.Mocked<OrdersService>;

    const mockOrder: any = {
        id: '1',
        total: 50.0,
        items: [],
        createdAt: new Date(),
    };

    const mockOrdersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        count: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [
                {
                    provide: OrdersService,
                    useValue: mockOrdersService,
                },
            ],
        }).compile();

        controller = module.get<OrdersController>(OrdersController);
        ordersService = module.get(OrdersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should return order created message', async () => {
            const createOrderDto: CreateOrderDto = {} as any;

            const result = await controller.create(createOrderDto);

            expect(result).toEqual({ message: 'Order created', order: 'TODO' });
        });
    });

    describe('findAll', () => {
        it('should return orders list', async () => {
            const expectedResult = [mockOrder];

            ordersService.findAll.mockResolvedValue(expectedResult);

            const result = await controller.findAll();

            expect(result).toEqual(expectedResult);
            expect(ordersService.findAll).toHaveBeenCalled();
        });

        it('should handle empty results', async () => {
            ordersService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return TODO message', async () => {
            const result = await controller.findOne('1');

            expect(result).toEqual({ order: 'TODO' });
        });
    });
});
