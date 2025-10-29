import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let productRepository: Repository<Product>;
  let userRepository: Repository<User>;

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
        buyerId: 'buyer1',
        items: [
          {
            productId: 'product1',
            quantity: 2,
            price: 10.99,
          },
        ],
        total: 21.98,
      };

      mockUserRepository.findOne.mockResolvedValue(mockBuyer);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderItemRepository.create.mockReturnValue(mockOrderItem);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'buyer1' } });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { id: 'product1' } });
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if buyer not found (error path)', async () => {
      const createOrderDto = {
        buyerId: 'nonexistent',
        items: [
          {
            productId: 'product1',
            quantity: 2,
            price: 10.99,
          },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found (error path)', async () => {
      const mockBuyer = {
        id: 'buyer1',
        email: 'buyer@example.com',
      };

      const createOrderDto = {
        buyerId: 'buyer1',
        items: [
          {
            productId: 'nonexistent',
            quantity: 2,
            price: 10.99,
          },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(mockBuyer);
      mockProductRepository.findOne.mockResolvedValue(null);
      mockOrderRepository.create.mockReturnValue({ items: [] });

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error (error path)', async () => {
      const mockBuyer = {
        id: 'buyer1',
        email: 'buyer@example.com',
      };

      const mockProduct = {
        id: 'product1',
        name: 'Test Product',
        price: 10.99,
      };

      const createOrderDto = {
        buyerId: 'buyer1',
        items: [
          {
            productId: 'product1',
            quantity: 2,
            price: 10.99,
          },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(mockBuyer);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockOrderRepository.create.mockReturnValue({ items: [] });
      mockOrderItemRepository.create.mockReturnValue({});
      mockOrderRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createOrderDto)).rejects.toThrow(InternalServerErrorException);
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

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('order1');

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order1' },
        relations: ['items', 'buyer'],
      });
    });

    it('should return null if order not found (error path)', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
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
        relations: ['items', 'buyer'],
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
