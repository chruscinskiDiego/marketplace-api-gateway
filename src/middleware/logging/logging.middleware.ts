import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {

  private readonly logger = new Logger('HTTP');

  use(req: any, res: any, next: () => void) {

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${ip} ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    res.on('finish', () => {

      const {statusCode} = res;

      const contentLength = res.get('Content-Length') || 0;

      const duration = Date.now() - startTime;

      this.logger.log(`Completed Request: ${ip} ${method} ${originalUrl} - ${statusCode} - ${contentLength} bytes - ${duration}ms`);

      if(statusCode >= 400){

        this.logger.error(`Response Error: ${ip} ${method} ${originalUrl} - ${statusCode} - ${userAgent}`);

      }

    });

    res.on('error', (err) => {

      this.logger.error(`Response Error: ${ip} ${method} ${originalUrl} - ${userAgent} - ${err.message}`);
      
    });

    req.on('timeout', () => {

      this.logger.warn(`Request Timeout: ${ip} ${method} ${originalUrl} - ${userAgent}`);

    });

    next();

  }
}
