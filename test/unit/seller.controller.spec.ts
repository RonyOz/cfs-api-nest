import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from '../../src/modules/users/seller.controller';
import { UsersService } from '../../src/modules/users/users.service';
import { NotFoundException } from '@nestjs/common';

const mockUsersService = {
  findAllSellers: jest.fn(),
  findSellerProfile: jest.fn(),
};

describe('SellerController', () => {
  let controller: SellerController;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<SellerController>(SellerController);
    usersService = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('should return sellers list', async () => {
    const result = [{ id: 1 }];
    usersService.findAllSellers.mockResolvedValue(result);
    expect(await controller.findAll({} as any)).toBe(result);
    expect(usersService.findAllSellers).toHaveBeenCalled();
  });

  it('should return seller profile', async () => {
    const profile = { id: 'abc' };
    usersService.findSellerProfile.mockResolvedValue(profile);
    expect(await controller.findOne('abc')).toBe(profile);
    expect(usersService.findSellerProfile).toHaveBeenCalledWith('abc');
  });

  it('should throw NotFoundException if seller not found', async () => {
    usersService.findSellerProfile.mockResolvedValue(null);
    await expect(controller.findOne('notfound')).rejects.toThrow(NotFoundException);
  });
});
