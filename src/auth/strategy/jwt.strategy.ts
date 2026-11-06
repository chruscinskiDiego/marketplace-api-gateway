import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtUser } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  validate(payload: unknown): JwtUser {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('userId' in payload) ||
      typeof payload.userId !== 'string' ||
      payload.userId.trim().length === 0 ||
      !('email' in payload) ||
      typeof payload.email !== 'string' ||
      payload.email.trim().length === 0 ||
      !('role' in payload) ||
      typeof payload.role !== 'string' ||
      payload.role.trim().length === 0
    ) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
