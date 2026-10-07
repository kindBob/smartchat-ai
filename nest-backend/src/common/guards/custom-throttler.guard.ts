import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.user?.id ?? req.ip;
    }

    protected async handleRequest(requestProps: Parameters<ThrottlerGuard["handleRequest"]>[0]): Promise<boolean> {
        const { context, limit, ttl, throttler, generateKey, getTracker, blockDuration } = requestProps;

        const request = context.switchToHttp().getRequest();

        const tracker = await getTracker(request, context);

        const key = generateKey(context, tracker, throttler.name ?? "default");

        const { totalHits, timeToExpire } = await this.storageService.increment(
            key,
            ttl,
            limit,
            blockDuration,
            throttler.name ?? "default"
        );

        if (totalHits > limit) {
            const response = context.switchToHttp().getResponse();

            const retryAfter = timeToExpire;

            response.status(429).json({
                statusCode: 429,
                message: "Too many requests",
                retryAfter,
            });

            return false;
        }

        return true;
    }
}
