import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of users without passwords (happy path)', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          password: 'hashedpass1',
          role: 'user',
        },
        {
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
          password: 'hashedpass2',
          role: 'user',
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
    });

    it('should throw InternalServerErrorException on database error (error path)', async () => {
      mockUserRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll({ limit: 10, offset: 0 })).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new user without password in response (happy path)', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        fullName: 'New User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: '123',
        ...createUserDto,
        role: 'user',
      });
      mockUserRepository.save.mockResolvedValue({
        id: '123',
        email: createUserDto.email,
        username: createUserDto.username,
        fullName: createUserDto.fullName,
        password: 'hashedpassword',
        role: 'user',
      });

      const result = await service.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(createUserDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists (error path)', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        username: 'existing',
        password: 'password123',
        fullName: 'Existing User',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: '123',
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by UUID without password (happy path)', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });

    it('should return user by email without password (happy path)', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('test@example.com');

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException if user not found (error path)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user successfully (happy path)', async () => {
      const updateUserDto = {
        fullName: 'Updated Name',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Old Name',
        password: 'hashedpassword',
        role: 'user',
      };

      mockUserRepository.preload.mockResolvedValue({
        ...mockUser,
        fullName: updateUserDto.fullName,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        fullName: updateUserDto.fullName,
      });
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        fullName: updateUserDto.fullName,
      });

      const result = await service.update('123', updateUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result.fullName).toBe(updateUserDto.fullName);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found (error path)', async () => {
      const updateUserDto = {
        fullName: 'Updated Name',
      };

      mockUserRepository.preload.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password if password is being updated (happy path)', async () => {
      const updateUserDto = {
        password: 'newpassword123',
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'oldhashedpassword',
        role: 'user',
      };

      mockUserRepository.preload.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newhashedpassword'));

      await service.update('123', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user successfully (happy path)', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await service.remove('123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found (error path)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user with password for auth purposes (happy path)', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found (error path)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
