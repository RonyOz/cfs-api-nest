import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../../src/modules/orders/entities/order.entity';
import { OrderItem } from '../../src/modules/orders/entities/order-item.entity';
import { Product } from '../../src/modules/products/entities/product.entity';
import { User } from '../../src/modules/users/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus } from '../../src/modules/orders/dto/update-order-status.dto';

describe('OrdersService - Additional Tests', () => {
    let service: OrdersService;
    let orderRepository: Repository<Order>;
    let mockQueryRunner: any;

    const mockOrderRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockProductRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        mockQueryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
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
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockProductRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {},
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    });

    describe('updateStatus', () => {
        it('should allow seller to update their order status (happy path)', async () => {
            const mockSeller = { id: 'seller1', role: 'user' };
            const mockOrder = {
                id: 'order1',
                status: OrderStatus.PENDING,
                buyer: { id: 'buyer1' },
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                ],
            };

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);
            mockOrderRepository.save.mockResolvedValue({ ...mockOrder, status: OrderStatus.ACCEPTED });

            const result = await service.updateStatus(
                'order1',
                { status: OrderStatus.ACCEPTED },
                mockSeller as User,
            );

            expect(result.status).toBe(OrderStatus.ACCEPTED);
            expect(mockOrderRepository.save).toHaveBeenCalled();
        });

        it('should allow admin to update any order status (happy path)', async () => {
            const mockAdmin = { id: 'admin1', role: 'admin' };
            const mockOrder = {
                id: 'order1',
                status: OrderStatus.PENDING,
                buyer: { id: 'buyer1' },
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                ],
            };

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);
            mockOrderRepository.save.mockResolvedValue({ ...mockOrder, status: OrderStatus.ACCEPTED });

            const result = await service.updateStatus(
                'order1',
                { status: OrderStatus.ACCEPTED },
                mockAdmin as User,
            );

            expect(result.status).toBe(OrderStatus.ACCEPTED);
        });

        it('should throw ForbiddenException if non-seller tries to update status (error path)', async () => {
            const mockUser = { id: 'user1', role: 'user' };
            const mockOrder = {
                id: 'order1',
                status: OrderStatus.PENDING,
                buyer: { id: 'buyer1' },
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                ],
            };

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);

            await expect(
                service.updateStatus('order1', { status: OrderStatus.ACCEPTED }, mockUser as User),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException for invalid status transitions (error path)', async () => {
            const mockSeller = { id: 'seller1', role: 'user' };
            const mockOrder = {
                id: 'order1',
                status: OrderStatus.DELIVERED, // Terminal state
                buyer: { id: 'buyer1' },
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                ],
            };

            mockOrderRepository.findOne.mockResolvedValue(mockOrder);

            await expect(
                service.updateStatus('order1', { status: OrderStatus.PENDING }, mockSeller as User),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('cancel', () => {

        it('should throw ForbiddenException if non-buyer tries to cancel (error path)', async () => {
            const mockUser = { id: 'user1', role: 'user' };
            const mockOrder = {
                id: 'order1',
                status: OrderStatus.PENDING,
                buyer: { id: 'buyer2' },
                items: [],
            };

            mockQueryRunner.manager.findOne.mockResolvedValue(mockOrder);

            await expect(
                service.cancel('order1', mockUser as User),
            ).rejects.toThrow(ForbiddenException);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        });

        it('should throw BadRequestException if order is not pending (error path)', async () => {
            const mockBuyer = { id: 'buyer1', role: 'user' };
            const mockOrder = {
                id: 'order1',
                status: OrderStatus.DELIVERED,
                buyer: { id: 'buyer1' },
                items: [],
            };

            mockQueryRunner.manager.findOne.mockResolvedValue(mockOrder);

            await expect(
                service.cancel('order1', mockBuyer as User),
            ).rejects.toThrow(BadRequestException);
            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        });
    });

    describe('isUserSellerOfOrder', () => {
        it('should return true if user is seller of any product in order', () => {
            const mockUser = { id: 'seller1', role: 'user' };
            const mockOrder = {
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                    {
                        product: {
                            seller: { id: 'seller2' },
                        },
                    },
                ],
            };

            // @ts-ignore - Accessing private method for testing
            const result = service['isUserSellerOfOrder'](mockOrder as Order, mockUser as User);
            expect(result).toBe(true);
        });

        it('should return false if user is not seller of any product', () => {
            const mockUser = { id: 'seller3', role: 'user' };
            const mockOrder = {
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                    {
                        product: {
                            seller: { id: 'seller2' },
                        },
                    },
                ],
            };

            // @ts-ignore - Accessing private method for testing
            const result = service['isUserSellerOfOrder'](mockOrder as Order, mockUser as User);
            expect(result).toBe(false);
        });
    });

    describe('canUserAccessOrder', () => {
        it('should return true for admin users', () => {
            const mockAdmin = { id: 'admin1', role: 'admin' };
            const mockOrder = {
                buyer: { id: 'buyer1' },
                items: [],
            };

            // @ts-ignore - Accessing private method for testing
            const result = service['canUserAccessOrder'](mockOrder as Order, mockAdmin as User);
            expect(result).toBe(true);
        });

        it('should return true for buyer of the order', () => {
            const mockBuyer = { id: 'buyer1', role: 'user' };
            const mockOrder = {
                buyer: { id: 'buyer1' },
                items: [],
            };

            // @ts-ignore - Accessing private method for testing
            const result = service['canUserAccessOrder'](mockOrder as Order, mockBuyer as User);
            expect(result).toBe(true);
        });

        it('should return false for non-related user', () => {
            const mockUser = { id: 'user1', role: 'user' };
            const mockOrder = {
                buyer: { id: 'buyer1' },
                items: [
                    {
                        product: {
                            seller: { id: 'seller1' },
                        },
                    },
                ],
            };

            // @ts-ignore - Accessing private method for testing
            const result = service['canUserAccessOrder'](mockOrder as Order, mockUser as User);
            expect(result).toBe(false);
        });
    });

    describe('validateStatusTransition', () => {
        const testCases = [
            { from: OrderStatus.PENDING, to: OrderStatus.ACCEPTED, shouldPass: true },
            { from: OrderStatus.PENDING, to: OrderStatus.CANCELED, shouldPass: true },
            { from: OrderStatus.PENDING, to: OrderStatus.DELIVERED, shouldPass: false },
            { from: OrderStatus.ACCEPTED, to: OrderStatus.DELIVERED, shouldPass: true },
            { from: OrderStatus.ACCEPTED, to: OrderStatus.CANCELED, shouldPass: true },
            { from: OrderStatus.DELIVERED, to: OrderStatus.CANCELED, shouldPass: false },
            { from: OrderStatus.CANCELED, to: OrderStatus.PENDING, shouldPass: false },
        ];

        testCases.forEach(({ from, to, shouldPass }) => {
            it(`should ${shouldPass ? 'allow' : 'reject'} transition from ${from} to ${to}`, () => {
                const testTransition = () => {
                    // @ts-ignore - Accessing private method for testing
                    service['validateStatusTransition'](from, to);
                };

                if (shouldPass) {
                    expect(testTransition).not.toThrow();
                } else {
                    expect(testTransition).toThrow(BadRequestException);
                }
            });
        });
    });
});