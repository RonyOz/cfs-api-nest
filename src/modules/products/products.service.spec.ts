import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of products with seller info (happy path)', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 10.99,
          stock: 100,
          seller: { id: 'seller1', email: 'seller1@example.com' },
        },
        {
          id: '2',
          name: 'Product 2',
          description: 'Description 2',
          price: 20.99,
          stock: 50,
          seller: { id: 'seller2', email: 'seller2@example.com' },
        },
      ];

      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('seller');
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        relations: ['seller'],
      });
    });

    it('should throw InternalServerErrorException on database error (error path)', async () => {
      mockProductRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll({ limit: 10, offset: 0 })).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return product by UUID (happy path)', async () => {
      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test Description',
        price: 15.99,
        stock: 75,
        seller: { id: 'seller1', email: 'seller1@example.com' },
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalled();
    });

    it('should return product by name (happy path)', async () => {
      const mockProduct = {
        id: '123',
        name: 'Test Product',
        description: 'Test Description',
        price: 15.99,
        stock: 75,
        seller: { id: 'seller1', email: 'seller1@example.com' },
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('Test Product');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found (error path)', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockProductRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new product successfully (happy path)', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 25.99,
        stock: 100,
      };

      const mockUser = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const mockProduct = {
        id: '123',
        ...createProductDto,
        seller: mockUser,
      };

      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto, mockUser);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        seller: mockUser,
      });
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException on duplicate product name (error path)', async () => {
      const createProductDto = {
        name: 'Duplicate Product',
        description: 'Description',
        price: 10.99,
        stock: 50,
      };

      const mockUser = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      mockProductRepository.create.mockReturnValue({});
      mockProductRepository.save.mockRejectedValue({ code: '23505', detail: 'Duplicate key' });

      await expect(service.create(createProductDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update product by owner successfully (happy path)', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 30.99,
      };

      const mockUser = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const existingProduct = {
        id: '123',
        name: 'Old Product',
        price: 20.99,
        seller: mockUser,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      mockProductRepository.findOne.mockResolvedValueOnce(existingProduct).mockResolvedValueOnce(updatedProduct);
      mockProductRepository.preload.mockResolvedValue(updatedProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update('123', updateProductDto, mockUser);

      expect(result.name).toBe(updateProductDto.name);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should update product by admin successfully (happy path)', async () => {
      const updateProductDto = {
        name: 'Updated by Admin',
      };

      const adminUser = {
        id: 'admin1',
        email: 'admin@example.com',
        role: 'admin',
      } as User;

      const productOwner = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const existingProduct = {
        id: '123',
        name: 'Old Product',
        seller: productOwner,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      mockProductRepository.findOne.mockResolvedValueOnce(existingProduct).mockResolvedValueOnce(updatedProduct);
      mockProductRepository.preload.mockResolvedValue(updatedProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update('123', updateProductDto, adminUser);

      expect(result.name).toBe(updateProductDto.name);
    });

    it('should throw NotFoundException if product not found (error path)', async () => {
      const updateProductDto = {
        name: 'Updated Product',
      };

      const mockUser = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateProductDto, mockUser)).rejects.toThrow(NotFoundException);
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not owner or admin (error path)', async () => {
      const updateProductDto = {
        name: 'Updated Product',
      };

      const mockUser = {
        id: 'user2',
        email: 'user2@example.com',
        role: 'user',
      } as User;

      const productOwner = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const existingProduct = {
        id: '123',
        name: 'Old Product',
        seller: productOwner,
      };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);

      await expect(service.update('123', updateProductDto, mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove product by owner successfully (happy path)', async () => {
      const mockUser = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const mockProduct = {
        id: '123',
        name: 'Product to Delete',
        seller: mockUser,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);

      await service.remove('123', mockUser);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['seller'],
      });
      expect(mockProductRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should remove product by admin successfully (happy path)', async () => {
      const adminUser = {
        id: 'admin1',
        email: 'admin@example.com',
        role: 'admin',
      } as User;

      const productOwner = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const mockProduct = {
        id: '123',
        name: 'Product to Delete',
        seller: productOwner,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);

      await service.remove('123', adminUser);

      expect(mockProductRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException if product not found (error path)', async () => {
      const mockUser = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
      expect(mockProductRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not owner or admin (error path)', async () => {
      const mockUser = {
        id: 'user2',
        email: 'user2@example.com',
        role: 'user',
      } as User;

      const productOwner = {
        id: 'seller1',
        email: 'seller@example.com',
        role: 'user',
      } as User;

      const mockProduct = {
        id: '123',
        name: 'Product to Delete',
        seller: productOwner,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.remove('123', mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockProductRepository.remove).not.toHaveBeenCalled();
    });
  });
});
