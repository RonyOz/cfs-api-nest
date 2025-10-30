import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from '../../src/modules/users/seller.controller';
import { UsersService } from '../../src/modules/users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('SellerController', () => {
  let controller: SellerController;
  let service: UsersService;

  const mockUsersService = {
    findAllSellers: jest.fn(),
    findSellerProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<SellerController>(SellerController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of sellers', async () => {
      const mockSellers = [
        {
          id: 'seller-1',
          username: 'seller1',
          productsCount: 5,
        },
      ];

      mockUsersService.findAllSellers.mockResolvedValue(mockSellers);

      const result = await controller.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual(mockSellers);
      expect(service.findAllSellers).toHaveBeenCalledWith({ limit: 10, offset: 0 });
    });
  });

  describe('findOne', () => {
    it('should return seller profile', async () => {
      const mockProfile = {
        seller: { id: 'seller-1', username: 'seller1' },
        products: [],
        salesHistory: [],
      };

      mockUsersService.findSellerProfile.mockResolvedValue(mockProfile);

      const result = await controller.findOne('seller-1');

      expect(result).toEqual(mockProfile);
      expect(service.findSellerProfile).toHaveBeenCalledWith('seller-1');
    });

    it('should throw NotFoundException when seller not found', async () => {
      mockUsersService.findSellerProfile.mockResolvedValue(null);

      await expect(controller.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});