import { Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return `${req.ip}-${req.headers['user-agent']}`;
  }

  protected async handleRequest(reqProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl } = reqProps;
    const { req, res } = this.getRequestResponse(context);
    const tracker = await this.getTracker(req);
    const trottlerName = reqProps.throttler.name ?? 'throttler-name';
    const key = this.generateKey(context, tracker, trottlerName);

    const totalHits = await this.storageService.increment(
      key,
      ttl,
      limit,
      1,
      trottlerName,
    );

    if (Number(totalHits) > limit) {
      res.setHeader('Retry-After', Math.round(ttl / 1000));
      throw new ThrottlerException();
    }

    res.setHeader(`${this.headerPrefix}-Limit`, reqProps.limit);
    res.setHeader(
      `${this.headerPrefix}-Remaining`,
      reqProps.limit - Number(totalHits),
    );
    res.setHeader(
      `${this.headerPrefix}-Reset`,
      Math.round(reqProps.ttl / 1000),
    );

    return true;
  }
}
