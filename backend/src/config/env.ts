import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/wandermatch'),
  JWT_SECRET: z.string().min(12).default('dev_only_change_this_secret'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_EMAIL: z.string().email().default('nextgenfusion.devs@gmail.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Ritesh5001@')
});

const parsedEnv = envSchema.parse(process.env);

export const env = parsedEnv;
