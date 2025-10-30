import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/modules/orders/orders.controller';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { CreateOrderDto } from '../../src/modules/orders/dto/create-order.dto';
import { UpdateOrderStatusDto, OrderStatus } from '../../src/modules/orders/dto/update-order-status.dto';
import { PassportModule } from '@nestjs/passport';
describe('OrdersController', () => {
    let controller: OrdersController;
    let service: OrdersService;

    const mockOrder = {
        id: '123',
        status: 'pending',
        total: 100,
        buyer: { id: 'buyer-id', email: 'buyer@test.com' },
        items: [],
        createdAt: new Date(),
    };

    const mockUser = {
        id: 'user-id',
        email: 'user@test.com',
        username: 'testuser',
        role: 'user',
    };

    const mockOrdersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        updateStatus: jest.fn(),
        cancel: jest.fn(),
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
        service = module.get<OrdersService>(OrdersService);
        
        // Limpiar mocks después de cada test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should return order created message', async () => {
            const createOrderDto: CreateOrderDto = {
                items: [{ productId: 'product-id', quantity: 2 }],
            };

            // Configurar el mock para que retorne el mockOrder
            mockOrdersService.create.mockResolvedValue(mockOrder);

            const result = await controller.create(createOrderDto, mockUser as any);

            expect(result).toEqual(mockOrder);
            expect(service.create).toHaveBeenCalledWith(createOrderDto, mockUser);
        });
    });

    describe('findAll', () => {
        it('should return all orders', async () => {
            const orders = [mockOrder];
            mockOrdersService.findAll.mockResolvedValue(orders);

            const result = await controller.findAll();

            expect(result).toEqual(orders);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return TODO message', async () => {
            // Configurar el mock para que retorne el mockOrder
            mockOrdersService.findOne.mockResolvedValue(mockOrder);

            const result = await controller.findOne('1', mockUser as any);

            expect(result).toEqual(mockOrder);
            expect(service.findOne).toHaveBeenCalledWith('1', mockUser);
        });
    });

    describe('updateStatus', () => {
        it('should update order status', async () => {
            const updateDto: UpdateOrderStatusDto = {
                status: OrderStatus.ACCEPTED,
            };
            const updatedOrder = { ...mockOrder, status: 'accepted' };

            mockOrdersService.updateStatus.mockResolvedValue(updatedOrder);

            const result = await controller.updateStatus('123', updateDto, mockUser as any);

            expect(result).toEqual(updatedOrder);
            expect(service.updateStatus).toHaveBeenCalledWith('123', updateDto, mockUser);
        });
    });

    describe('cancel', () => {
        it('should cancel an order', async () => {
            const canceledOrder = { ...mockOrder, status: 'canceled' };

            mockOrdersService.cancel.mockResolvedValue(canceledOrder);

            const result = await controller.cancel('123', mockUser as any);

            expect(result).toEqual(canceledOrder);
            expect(service.cancel).toHaveBeenCalledWith('123', mockUser);
        });
    });
});
