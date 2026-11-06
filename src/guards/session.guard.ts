import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/services/auth.service';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const sessionToken = request.headers['x-session-token'];

    if (typeof sessionToken !== 'string' || !sessionToken) {
      throw new UnauthorizedException('Session token required');
    }

    try {
      const session = await this.authService.validateSessionToken(sessionToken);

      if (!session.valid) {
        throw new UnauthorizedException('Invalid session token');
      }

      request.user = session.user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }
}
