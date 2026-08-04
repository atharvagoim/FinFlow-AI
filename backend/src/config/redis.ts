import IORedis from "ioredis";
import { env } from "./env";

// Shared Redis connection factory. BullMQ requires maxRetriesPerRequest: null
// on the connection it manages internally.
export function createRedisConnection(): IORedis {
  return new IORedis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    maxRetriesPerRequest: null,
  });
}

export const redisConnection = createRedisConnection();
