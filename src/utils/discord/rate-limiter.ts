import "server-only";
import { DiscordError, type DiscordErrorType } from "./types";

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private rateLimits = new Map<string, RateLimitInfo>();
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private updateRateLimitInfo(endpoint: string, headers: Headers) {
    const remaining = parseInt(headers.get("X-RateLimit-Remaining") ?? "1");
    const reset = parseInt(headers.get("X-RateLimit-Reset") ?? "0");
    const limit = parseInt(headers.get("X-RateLimit-Limit") ?? "1");

    this.rateLimits.set(endpoint, { remaining, reset, limit });
  }

  private async waitForRateLimit(endpoint: string): Promise<void> {
    const rateLimit = this.rateLimits.get(endpoint);
    if (!rateLimit) return;

    if (rateLimit.remaining <= 0) {
      const now = Math.floor(Date.now() / 1000);
      const waitTime = Math.max(0, (rateLimit.reset - now) * 1000);
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  async executeRequest<T>(
    endpoint: string,
    requestFn: () => Promise<Response>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await this.waitForRateLimit(endpoint);
          const response = await requestFn();
          this.updateRateLimitInfo(endpoint, response.headers);
          if (!response.ok) {
            const data = (await response.json()) as DiscordErrorType;
            throw new DiscordError(data.code, data.message);
          }

          const data = (await response.json()) as T;
          resolve(data);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      void this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
      }
    }

    this.processing = false;
  }
}

export const rateLimiter = RateLimiter.getInstance();
