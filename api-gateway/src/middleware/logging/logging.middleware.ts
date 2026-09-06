import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: () => void) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent');
    const startTime = Date.now();

    this.logger.log(
      `Incoming request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('Content-Length');
      const duration = Date.now() - startTime;

      this.logger.log(
        `Outgoing response: ${method} ${originalUrl} - ${statusCode} - ${contentLength || 0}b - ${duration}ms`,
      );

      if (statusCode >= 400) {
        this.logger.error(
          `Error response: ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }
    });

    res.on('error', (error: { message: any }) => {
      this.logger.error(
        `Response error: ${method} ${originalUrl} - ${error.message}`,
      );
    });

    res.on('timeout', () => {
      this.logger.warn(
        `Response timeout: ${method} ${originalUrl} - ${Date.now() - startTime}ms`,
      );
    });

    next();
  }
}
