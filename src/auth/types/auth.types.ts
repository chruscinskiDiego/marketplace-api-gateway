import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

export interface JwtPayload extends JwtUser {
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string | null;
}

export interface UserSession {
  valid: boolean;
  user: SessionUser;
}

export type AuthenticatedUser = JwtUser | SessionUser;

export interface AuthenticatedRequest extends Request<
  ParamsDictionary,
  unknown,
  unknown
> {
  user?: AuthenticatedUser;
}
