import { Module } from '@nestjs/common';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { LoggingMiddleware } from './logging/logging.middleware';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                ttl: minutes(1),
                limit: 100
            }
        ])
    ],
    providers: [LoggingMiddleware]
})
export class MiddlewareModule { }
