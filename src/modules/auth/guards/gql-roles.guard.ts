import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;

        if (!user || !user.role) {
            throw new ForbiddenException('Access denied: no user role');
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException(`Access denied: requires one of roles [${requiredRoles.join(', ')}]`);
        }

        return true;
    }
}
