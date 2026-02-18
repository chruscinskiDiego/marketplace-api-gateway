import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Observable } from 'rxjs';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {

  protected async getTracker(req: Record<string, any>): Promise<string> {

    return `${req.ip}-${req.headers['user-agent']}`;

  }

}

