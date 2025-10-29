import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';

jest.mock('bcrypt');
jest.mock('speakeasy');

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: Repository<User>;
    let jwtService: JwtService;

    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signup', () => {
        it('should create a new user and return token (happy path)', async () => {
            const signupDto = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
                fullName: 'Test User',
            };

            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockReturnValue({
                id: '123',
                ...signupDto,
                role: 'user',
            });
            mockUserRepository.save.mockResolvedValue({
                id: '123',
                email: signupDto.email,
                username: signupDto.username,
                role: 'user',
            });
            mockJwtService.sign.mockReturnValue('test-token');

            const result = await service.signup(signupDto);

            expect(result).toEqual({
                message: 'Signup succesful',
                token: 'test-token',
            });
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: signupDto.email } });
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw ConflictException if user already exists (error path)', async () => {
            const signupDto = {
                email: 'existing@example.com',
                username: 'existing',
                password: 'password123',
                fullName: 'Existing User',
            };

            mockUserRepository.findOne.mockResolvedValue({ id: '123', email: signupDto.email });

            await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: signupDto.email } });
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should login user and return token (happy path)', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                id: '123',
                email: loginDto.email,
                username: 'testuser',
                password: hashedPassword,
                role: 'user',
                twoFactorEnabled: false,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('test-token');
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login(loginDto);

            expect(result).toEqual({
                message: 'Login successful',
                token: 'test-token',
            });
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
        });

        it('should throw UnauthorizedException if user not found (error path)', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
        });

        it('should throw UnauthorizedException if password is invalid (error path)', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                id: '123',
                email: loginDto.email,
                password: hashedPassword,
                twoFactorEnabled: false,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if 2FA is enabled but token not provided (error path)', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                id: '123',
                email: loginDto.email,
                password: hashedPassword,
                twoFactorEnabled: true,
                twoFactorSecret: 'secret',
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
        });
    });

    describe('enable2FA', () => {
        it('should enable 2FA and return secret and QR code (happy path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: false,
                twoFactorSecret: null,
            } as User;

            (speakeasy.generateSecret as jest.Mock).mockReturnValue({
                base32: 'TESTSECRET',
                otpauth_url: 'otpauth://totp/test',
            });

            mockUserRepository.save.mockResolvedValue(mockUser);

            const result = await service.enable2FA(mockUser);

            expect(result).toHaveProperty('secret');
            expect(result).toHaveProperty('qrCode');
            expect(result.secret).toBe('TESTSECRET');
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if 2FA is already enabled (error path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: true,
                twoFactorSecret: 'secret',
            } as User;

            await expect(service.enable2FA(mockUser)).rejects.toThrow(BadRequestException);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('verify2FA', () => {
        it('should verify 2FA token and enable 2FA (happy path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: false,
                twoFactorSecret: 'TESTSECRET',
            } as User;

            const verify2FADto = {
                token: '123456',
            };

            (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
            mockUserRepository.save.mockResolvedValue({ ...mockUser, twoFactorEnabled: true });

            const result = await service.verify2FA(mockUser, verify2FADto);

            expect(result).toEqual({ message: '2FA enabled successfully' });
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if 2FA is not set up (error path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: false,
                twoFactorSecret: null,
            } as User;

            const verify2FADto = {
                token: '123456',
            };

            await expect(service.verify2FA(mockUser, verify2FADto)).rejects.toThrow(BadRequestException);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if token is invalid (error path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: false,
                twoFactorSecret: 'TESTSECRET',
            } as User;

            const verify2FADto = {
                token: 'invalid',
            };

            (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

            await expect(service.verify2FA(mockUser, verify2FADto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('disable2FA', () => {
        it('should disable 2FA successfully (happy path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: true,
                twoFactorSecret: 'TESTSECRET',
            } as User;

            const verify2FADto = {
                token: '123456',
            };

            (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
            mockUserRepository.save.mockResolvedValue({ ...mockUser, twoFactorEnabled: false, twoFactorSecret: null });

            const result = await service.disable2FA(mockUser, verify2FADto);

            expect(result).toEqual({ message: '2FA disabled successfully' });
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if 2FA is not enabled (error path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: false,
                twoFactorSecret: null,
            } as User;

            const verify2FADto = {
                token: '123456',
            };

            await expect(service.disable2FA(mockUser, verify2FADto)).rejects.toThrow(BadRequestException);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if token is invalid (error path)', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                twoFactorEnabled: true,
                twoFactorSecret: 'TESTSECRET',
            } as User;

            const verify2FADto = {
                token: 'invalid',
            };

            (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

            await expect(service.disable2FA(mockUser, verify2FADto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
    });
});
