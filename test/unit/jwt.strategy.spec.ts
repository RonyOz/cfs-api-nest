import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../src/modules/auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../src/modules/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jwt } from '../../src/modules/auth/interfaces/jwt.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload: Jwt = {
      id: '1',
      username: 'testuser',
      role: 'user'
    };

    it('should return user without password when valid token payload', async () => {
      const user = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@test.com',
        role: 'user',
      };

      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: 'user',
      });
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException when token payload has no id', async () => {
      const invalidPayload = {
        username: mockPayload.username,
        role: mockPayload.role
      } as Jwt;
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(strategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token payload is empty', async () => {
      await expect(strategy.validate({} as Jwt)).rejects.toThrow(UnauthorizedException);
    });
  });
});