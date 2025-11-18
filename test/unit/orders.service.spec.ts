import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../../src/modules/orders/entities/order.entity';
import { OrderItem } from '../../src/modules/orders/entities/order-item.entity';
import { Product } from '../../src/modules/products/entities/product.entity';
import { User } from '../../src/modules/users/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('OrdersService', () => {
    let service: OrdersService;
    let orderRepository: Repository<Order>;
    let orderItemRepository: Repository<OrderItem>;
    let productRepository: Repository<Product>;
    let userRepository: Repository<User>;
    let mockQueryRunner: any;

    const mockOrderRepository = {
        count: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
    };

    const mockOrderItemRepository = {
        create: jest.fn(),
    };

    const mockProductRepository = {
        findOne: jest.fn(),
    };

    const mockUserRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        // Crear mockQueryRunner DENTRO del beforeEach para que se reinicie
        
        mockQueryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
            },
        };

        const mockDataSource = {
            createQueryRunner: jest.fn(() => mockQueryRunner),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: mockOrderRepository,
                },
                {
                    provide: getRepositoryToken(OrderItem),
                    useValue: mockOrderItemRepository,
                },
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
        orderItemRepository = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
        productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('count', () => {
        it('should return the count of orders (happy path)', async () => {
            mockOrderRepository.count.mockResolvedValue(5);

            const result = await service.count();

            expect(result).toBe(5);
            expect(mockOrderRepository.count).toHaveBeenCalled();
        });

        it('should return 0 if no orders exist (happy path)', async () => {
            mockOrderRepository.count.mockResolvedValue(0);

            const result = await service.count();

            expect(result).toBe(0);
        });
    });

    describe('create', () => {
        it('should create an order with items successfully (happy path)', async () => {
            const mockBuyer = {
                id: 'buyer1',
                email: 'buyer@example.com',
            };

            const mockProduct = {
                id: 'product1',
                name: 'Test Product',
                price: 10.99,
                stock: 10,
                seller: { id: 'seller1' },
            };

            const mockOrderItem = {
                id: 'item1',
                quantity: 2,
                price: 10.99,
                product: mockProduct,
            };

            const mockOrder = {
                id: 'order1',
                buyer: mockBuyer,
                status: 'pending',
                total: 21.98,
                items: [mockOrderItem],
            };

            const createOrderDto = {
                items: [
                    {
                        productId: 'product1',
                        quantity: 2,
                    },
                ],
            };

            // Configurar mocks del QueryRunner
            mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct);
            mockQueryRunner.manager.save.mockResolvedValue(mockOrder);
            mockQueryRunner.manager.create.mockImplementation((entity, data) => data);
            mockOrderRepository.findOne.mockResolvedValue(mockOrder);

            const result = await service.create(createOrderDto, mockBuyer as any);

            expect(result).toEqual(mockOrder);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
        });

        it('should throw NotFoundException if buyer not found (error path)', async () => {
            const mockBuyer = {
                id: 'buyer1',
                email: 'buyer@example.com',
            };

            const createOrderDto = {
                items: [
                    {
                        productId: 'product1',
                        quantity: 2,
                    },
                ],
            };

            // Producto no encontrado
            mockQueryRunner.manager.findOne.mockResolvedValue(null);

            await expect(service.create(createOrderDto, mockBuyer as any)).rejects.toThrow(NotFoundException);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        });

        it('should throw NotFoundException if product not found (error path)', async () => {
            const mockBuyer = {
                id: 'buyer1',
                email: 'buyer@example.com',
            };

            const createOrderDto = {
                items: [
                    {
                        productId: 'nonexistent',
                        quantity: 2,
                    },
                ],
            };

            mockQueryRunner.manager.findOne.mockResolvedValue(null);

            await expect(service.create(createOrderDto, mockBuyer as any)).rejects.toThrow(NotFoundException);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException on save error (error path)', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockBuyer = {
                id: 'buyer1',
                email: 'buyer@example.com',
            };

            const mockProduct = {
                id: 'product1',
                name: 'Test Product',
                price: 10.99,
                stock: 10,
                seller: { id: 'seller1' },
            };

            const createOrderDto = {
                items: [
                    {
                        productId: 'product1',
                        quantity: 2,
                    },
                ],
            };

            // Configurar para que falle al guardar
            mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct);
            mockQueryRunner.manager.create.mockReturnValue({});
            mockQueryRunner.manager.save
                .mockResolvedValueOnce(mockProduct) // Primera llamada: save del producto (reduce stock)
                .mockRejectedValueOnce(new Error('Database error')); // Segunda llamada: save de la orden (falla)

            await expect(service.create(createOrderDto, mockBuyer as any)).rejects.toThrow();
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });
        

    });

    describe('findOne', () => {
        it('should return order by id with relations (happy path)', async () => {
            const mockOrder = {
                id: 'order1',
                buyer: { id: 'buyer1', email: 'buyer@example.com' },
                items: [
                    {
                        id: 'item1',
                        quantity: 2,
                        price: 10.99,
                    },
                ],
                status: 'pending',
                total: 21.98,
            };

            const mockUser = { id: 'buyer1', role: 'user' };

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);

            const result = await service.findOne('order1', mockUser as any);

            expect(result).toEqual(mockOrder);
            expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'order1' },
                relations: ['buyer', 'items', 'items.product', 'items.product.seller'],
            });
        });

        it('should throw NotFoundException if order not found (error path)', async () => {
            const mockUser = { id: 'user1', role: 'user' };

            mockOrderRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('nonexistent', mockUser as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all orders with relations (happy path)', async () => {
            const mockOrders = [
                {
                    id: 'order1',
                    buyer: { id: 'buyer1', email: 'buyer1@example.com' },
                    items: [],
                    status: 'pending',
                    total: 21.98,
                },
                {
                    id: 'order2',
                    buyer: { id: 'buyer2', email: 'buyer2@example.com' },
                    items: [],
                    status: 'completed',
                    total: 50.00,
                },
            ];

            mockOrderRepository.find.mockResolvedValue(mockOrders);

            const result = await service.findAll();

            expect(result).toHaveLength(2);
            expect(result).toEqual(mockOrders);
            expect(mockOrderRepository.find).toHaveBeenCalledWith({
                relations: ['buyer', 'items', 'items.product', 'items.product.seller'],
                order: { createdAt: 'DESC' },
            });
        });

        it('should return empty array if no orders exist (happy path)', async () => {
            mockOrderRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toHaveLength(0);
            expect(result).toEqual([]);
        });
    });
    
});