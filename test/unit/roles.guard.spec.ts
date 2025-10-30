import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const createMockExecutionContext = (request: any): ExecutionContext => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request)
    }),
    getType: jest.fn()
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const mockContext = createMockExecutionContext({});
    jest.spyOn(reflector, 'get').mockReturnValue([]);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const mockContext = createMockExecutionContext({
      user: { role: 'admin' }
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw ForbiddenException when no user in request', () => {
    const mockContext = createMockExecutionContext({});
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    const mockContext = createMockExecutionContext({
      user: { role: 'user' }
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no role property', () => {
    const mockContext = createMockExecutionContext({
      user: {} // user without role
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});