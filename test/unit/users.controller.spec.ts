import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';
import { CreateUserDto } from '../../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/users/dto/update-user.dto';
import { PaginationDto } from '../../src/modules/users/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { PassportModule } from '@nestjs/passport';

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: jest.Mocked<UsersService>;

    const mockUser: any = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: 'user',
    };

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockAuthGuard = {
        canActivate: jest.fn(() => true),
    };

    const mockRolesGuard = {
        canActivate: jest.fn(() => true),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue(mockAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newuser',
                email: 'newuser@test.com',
                password: 'password123',
                phoneNumber: '+1234567890',
            };

            usersService.create.mockResolvedValue(mockUser);

            const result = await controller.create(createUserDto);

            expect(result).toEqual(mockUser);
            expect(usersService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should throw error when creation fails', async () => {
            const createUserDto: CreateUserDto = {
                username: 'duplicate',
                email: 'duplicate@test.com',
                password: 'password123',
                phoneNumber: '+1234567890',
            };

            usersService.create.mockRejectedValue(new Error('User already exists'));

            await expect(controller.create(createUserDto)).rejects.toThrow(
                'User already exists',
            );
        });
    });

    describe('findAll', () => {
        it('should return users list', async () => {
            const paginationDto: PaginationDto = {};
            const expectedResult = [mockUser];

            usersService.findAll.mockResolvedValue(expectedResult);

            const result = await controller.findAll(paginationDto);

            expect(result).toEqual(expectedResult);
            expect(usersService.findAll).toHaveBeenCalledWith(paginationDto);
        });

        it('should handle empty results', async () => {
            const paginationDto: PaginationDto = {};

            usersService.findAll.mockResolvedValue([]);

            const result = await controller.findAll(paginationDto);

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            usersService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne('1', mockUser as any);

            expect(result).toEqual(mockUser);
            expect(usersService.findOne).toHaveBeenCalledWith('1', mockUser);
        });

        it('should throw error when user not found', async () => {
            usersService.findOne.mockRejectedValue(new Error('User not found'));

            await expect(controller.findOne('999', mockUser as any)).rejects.toThrow(
                'User not found',
            );
        });
    });

    describe('update', () => {
        it('should update user', async () => {
            const updateUserDto: UpdateUserDto = {
                username: 'updateduser',
            };
            const updatedUser = { ...mockUser, username: 'updateduser' };

            usersService.update.mockResolvedValue(updatedUser);

            const result = await controller.update('1', updateUserDto, mockUser as any);

            expect(result).toEqual(updatedUser);
            expect(usersService.update).toHaveBeenCalledWith('1', updateUserDto, mockUser);
        });

        it('should throw error when update fails', async () => {
            const updateUserDto: UpdateUserDto = {
                username: 'updateduser',
            };

            usersService.update.mockRejectedValue(new Error('Update failed'));

            await expect(controller.update('1', updateUserDto, mockUser as any)).rejects.toThrow(
                'Update failed',
            );
        });
    });

    describe('remove', () => {
        it('should remove user', async () => {
            usersService.remove.mockResolvedValue(undefined);

            await controller.remove('1');

            expect(usersService.remove).toHaveBeenCalledWith('1');
        });

        it('should throw error when deletion fails', async () => {
            usersService.remove.mockRejectedValue(new Error('Delete failed'));

            await expect(controller.remove('1')).rejects.toThrow('Delete failed');
        });
    });
});
