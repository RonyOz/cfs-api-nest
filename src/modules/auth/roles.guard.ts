import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly requiredRoles: string[] = []) {}

  canActivate(context: ExecutionContext): boolean {
    // TODO: implement roles checking using request.user and requiredRoles
    return true;
  }
}
