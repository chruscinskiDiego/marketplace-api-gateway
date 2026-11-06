import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { serviceConfig } from '../../config/gateway.config';
import type { LoginDto } from '../dto/login.dto';
import type { RegisterDto } from '../dto/register.dto';
import type { JwtPayload, UserSession } from '../types/auth.types';

export type { UserSession } from '../types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async validateJwtToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

  async validateSessionToken(sessionToken: string): Promise<UserSession> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<UserSession>(
          `${serviceConfig.users.url}/sessions/validate/${sessionToken}`,
          { timeout: serviceConfig.users.timeout },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }

  async login(loginDto: LoginDto): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<unknown, LoginDto>(
          `${serviceConfig.users.url}/sessions`,
          loginDto,
          { timeout: serviceConfig.users.timeout },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(registerDto: RegisterDto): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<unknown, RegisterDto>(
          `${serviceConfig.users.url}/auth/register`,
          registerDto,
          { timeout: serviceConfig.users.timeout },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Error occurred while registering');
    }
  }
}
