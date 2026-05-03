import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/wandermatch'),
  JWT_SECRET: z.string().min(12).default('dev_only_change_this_secret'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
