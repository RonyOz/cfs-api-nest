import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Allow bypass in development for faster iteration
    // if (process.env.AUTH_DISABLED === 'true') {
      const request = context.switchToHttp().getRequest();
      if (!request.user) {
        const mockRole = process.env.DEV_AUTH_USER_ROLE || 'admin';
        request.user = { id: 'dev', username: 'dev', role: mockRole };
      }
      return true;
    // }

    // Delegate to Passport's AuthGuard (which uses JwtStrategy)
    // return super.canActivate(context);
  }
}
