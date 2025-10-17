import { Redis } from "ioredis";

export const redisConnection = new Redis({
  // Изменено: используем Redis, а не IORedis
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379", 10), // Добавлена дефолтная строка и radix
  maxRetriesPerRequest: null,
});
