import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { SignupDto } from '../../src/modules/auth/dto/signup.dto';
import { Verify2FADto } from '../../src/modules/auth/dto/verify-2fa.dto';
import { User } from '../../src/modules/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    const mockUser = {
        id: '1',
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user',
        twoFactorSecret: null,
        twoFactorEnabled: false,
        products: [],
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

    const mockAuthService = {
        login: jest.fn(),
        signup: jest.fn(),
        enable2FA: jest.fn(),
        verify2FA: jest.fn(),
        disable2FA: jest.fn(),
    };

    const mockAuthGuard = {
        canActivate: jest.fn(() => true),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue(mockAuthGuard)
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return access token on successful login', async () => {
            const loginDto: LoginDto = {
                email: 'test@test.com',
                password: 'password123',
            };
            const expectedResult = { message: 'Login successful', token: 'jwt-token' };

            authService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(loginDto);

            expect(result).toEqual(expectedResult);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should throw error when login fails', async () => {
            const loginDto: LoginDto = {
                email: 'test@test.com',
                password: 'wrongpassword',
            };

            authService.login.mockRejectedValue(
                new Error('Invalid credentials'),
            );

            await expect(controller.login(loginDto)).rejects.toThrow(
                'Invalid credentials',
            );
        });
    });

    describe('signup', () => {
        it('should create user and return access token', async () => {
            const signupDto: SignupDto = {
                username: 'newuser',
                email: 'new@test.com',
                password: 'password123',
            };
            const expectedResult = { message: 'Signup successful', token: 'jwt-token' };

            authService.signup.mockResolvedValue(expectedResult);

            const result = await controller.signup(signupDto);

            expect(result).toEqual(expectedResult);
            expect(authService.signup).toHaveBeenCalledWith(signupDto);
        });

        it('should throw error when signup fails', async () => {
            const signupDto: SignupDto = {
                username: 'existinguser',
                email: 'existing@test.com',
                password: 'password123',
            };

            authService.signup.mockRejectedValue(
                new Error('User already exists'),
            );

            await expect(controller.signup(signupDto)).rejects.toThrow(
                'User already exists',
            );
        });
    });

    describe('enable2FA', () => {
        it('should enable 2FA and return QR code', async () => {
            const expectedResult = {
                secret: 'secret-key',
                qrCode: 'data:image/png;base64,...',
            };

            authService.enable2FA.mockResolvedValue(expectedResult);

            const result = await controller.enable2FA(mockUser);

            expect(result).toEqual(expectedResult);
            expect(authService.enable2FA).toHaveBeenCalledWith(mockUser);
        });

        it('should throw error when enable2FA fails', async () => {
            authService.enable2FA.mockRejectedValue(
                new Error('Failed to enable 2FA'),
            );

            await expect(controller.enable2FA(mockUser)).rejects.toThrow(
                'Failed to enable 2FA',
            );
        });
    });

    describe('verify2FA', () => {
        it('should verify 2FA token successfully', async () => {
            const verify2FADto: Verify2FADto = { token: '123456' };
            const expectedResult = { message: '2FA verified successfully' };

            authService.verify2FA.mockResolvedValue(expectedResult);

            const result = await controller.verify2FA(mockUser, verify2FADto);

            expect(result).toEqual(expectedResult);
            expect(authService.verify2FA).toHaveBeenCalledWith(mockUser, verify2FADto);
        });

        it('should throw error when token is invalid', async () => {
            const verify2FADto: Verify2FADto = { token: 'invalid' };

            authService.verify2FA.mockRejectedValue(new Error('Invalid token'));

            await expect(
                controller.verify2FA(mockUser, verify2FADto),
            ).rejects.toThrow('Invalid token');
        });
    });

    describe('disable2FA', () => {
        it('should disable 2FA successfully', async () => {
            const verify2FADto: Verify2FADto = { token: '123456' };
            const expectedResult = { message: '2FA disabled' };

            authService.disable2FA.mockResolvedValue(expectedResult);

            const result = await controller.disable2FA(mockUser, verify2FADto);

            expect(result).toEqual(expectedResult);
            expect(authService.disable2FA).toHaveBeenCalledWith(mockUser, verify2FADto);
        });

        it('should throw error when disable2FA fails', async () => {
            const verify2FADto: Verify2FADto = { token: '123456' };

            authService.disable2FA.mockRejectedValue(
                new Error('Failed to disable 2FA'),
            );

            await expect(
                controller.disable2FA(mockUser, verify2FADto),
            ).rejects.toThrow('Failed to disable 2FA');
        });
    });

    describe('profile', () => {
        it('should return user profile', async () => {
            const result = await controller.profile(mockUser);

            expect(result).toEqual({ user: mockUser });
        });
    });
});
