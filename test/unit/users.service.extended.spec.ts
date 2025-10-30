import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

describe('UsersService - Additional Tests', () => {
    let service: UsersService;
    let mockQueryBuilder: any;

    const mockUserRepository = {
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
        manager: {
            createQueryBuilder: jest.fn(),
        },
    };

    beforeEach(async () => {
        mockQueryBuilder = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            loadRelationCountAndMap: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            execute: jest.fn(),
            findOne: jest.fn(),
        };

        mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
        mockUserRepository.manager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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
    });

    describe('findAllSellers', () => {
        it('should return sellers with their products count (happy path)', async () => {
            const mockSellers = [
                {
                    id: 'seller1',
                    username: 'seller1',
                    password: 'hashedpass',
                    products: [
                        {
                            id: 'product1',
                            name: 'Product 1',
                            price: 10.99,
                            stock: 5,
                        },
                    ],
                    productsCount: 1,
                },
                {
                    id: 'seller2',
                    username: 'seller2',
                    password: 'hashedpass',
                    products: [],
                    productsCount: 0,
                },
            ];

            mockQueryBuilder.getMany.mockResolvedValue(mockSellers);

            const result = await service.findAllSellers({ limit: 10, offset: 0 });

            expect(result).toHaveLength(2);
            expect(result[0]).not.toHaveProperty('password');
            expect(result[0]).toHaveProperty('productsCount');
            expect(result[0]).toHaveProperty('products');
            expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
        });

        it('should handle empty result (happy path)', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await service.findAllSellers({ limit: 10, offset: 0 });

            expect(result).toEqual([]);
        });

        it('should handle database error (error path)', async () => {
            mockQueryBuilder.getMany.mockRejectedValue(new Error('Database error'));

            await expect(
                service.findAllSellers({ limit: 10, offset: 0 }),
            ).rejects.toThrow();
        });
    });

    describe('findSellerProfile', () => {

        it('should throw BadRequestException for invalid UUID (error path)', async () => {
            await expect(
                service.findSellerProfile('invalid-uuid'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should return null if seller not found (error path)', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findSellerProfile('e8c4ad17-9d62-4c9a-9a6c-0bae09d395a8');

            expect(result).toBeNull();
        });

        it('should handle empty sales history (happy path)', async () => {
            const mockUser = {
                id: 'seller1',
                username: 'seller1',
                email: 'seller1@example.com',
                password: 'hashedpass',
                twoFactorEnabled: false,
                products: [],
            };

            mockQueryBuilder.execute.mockResolvedValue([]);
            mockUserRepository.findOne.mockResolvedValue(mockUser);


        });

    });
});