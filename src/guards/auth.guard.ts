import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import type { JwtUser } from '../auth/types/auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = JwtUser>(
    err: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    if (err) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Unauthorized');
    }

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
