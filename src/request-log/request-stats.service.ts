import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ContextLogger, LoggerService } from '../logger/logger.service';

const SUMMARY_INTERVAL_MS = 60_000;
const TOP_CLIENTS = 10;
// Bounds memory if traffic comes from many distinct IPs
const MAX_TRACKED_CLIENTS = 10_000;
const OTHER_CLIENTS = 'other';

interface ClientStats {
  requests: number;
  rateLimited: number;
}

/**
 * Counts requests per client IP and logs the busiest clients once per interval.
 */
@Injectable()
export class RequestStatsService {
  private readonly logger: ContextLogger;
  private clients = new Map<string, ClientStats>();

  constructor(loggerService: LoggerService) {
    this.logger = loggerService.forContext('RequestStats');
  }

  record(ip: string, statusCode: number): void {
    const key =
      this.clients.has(ip) || this.clients.size < MAX_TRACKED_CLIENTS
        ? ip
        : OTHER_CLIENTS;
    let stats = this.clients.get(key);
    if (!stats) {
      stats = { requests: 0, rateLimited: 0 };
      this.clients.set(key, stats);
    }
    stats.requests++;

    if (statusCode === 429) {
      stats.rateLimited++;
      // Warn once per client per interval instead of on every blocked request
      if (stats.rateLimited === 1) {
        this.logger.warn(`Rate limit exceeded ip=${key}`);
      }
    }
  }

  @Interval(SUMMARY_INTERVAL_MS)
  logSummary(): void {
    const clients = this.clients;
    this.clients = new Map();
    if (clients.size === 0) {
      return;
    }

    let total = 0;
    let totalRateLimited = 0;
    for (const stats of clients.values()) {
      total += stats.requests;
      totalRateLimited += stats.rateLimited;
    }

    const top = [...clients.entries()]
      .sort(([, a], [, b]) => b.requests - a.requests)
      .slice(0, TOP_CLIENTS)
      .map(
        ([ip, s]) =>
          `${ip}=${s.requests}` +
          (s.rateLimited ? ` (${s.rateLimited} rate-limited)` : ''),
      )
      .join(', ');

    this.logger.log(
      `Last ${SUMMARY_INTERVAL_MS / 1000}s: ${total} requests, ${totalRateLimited} rate-limited, ` +
        `${clients.size} clients. Top: ${top}`,
    );
  }
}
