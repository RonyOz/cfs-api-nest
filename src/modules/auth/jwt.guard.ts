import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // TODO: integrate passport/jwt and validate token
    // This guard is a placeholder to be implemented
    const request = context.switchToHttp().getRequest();
    // Allow through for now; implement proper validation
    return true;
  }
}
