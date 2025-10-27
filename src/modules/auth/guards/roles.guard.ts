import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // // Allow bypass if auth is disabled (dev mode)
    // if (process.env.AUTH_DISABLED === 'true') {
    //   return true;
    // }

    // const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    // if (!requiredRoles || requiredRoles.length === 0) {
    //   // No roles required, allow
    //   return true;
    // }

    // const request = context.switchToHttp().getRequest();
    // const user = request.user;

    // if (!user || !user.role) {
    //   throw new ForbiddenException('Access denied: no user role');
    // }

    // const hasRole = requiredRoles.includes(user.role);
    // if (!hasRole) {
    //   throw new ForbiddenException(`Access denied: requires one of roles [${requiredRoles.join(', ')}]`);
    // }

    return true;
  }
}
