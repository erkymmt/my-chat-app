import { getRequestContext } from "@cloudflare/next-on-pages";
import { D1Database } from '@cloudflare/workers-types';

export const runtime = "edge";

interface ExtendedCloudflareEnv {
  DB: D1Database;
  AI: {
    run: (model: string, options: any) => Promise<any>;
  };
}

export const getEnv = (): ExtendedCloudflareEnv => {
  const context = getRequestContext();
  const env = context.env as ExtendedCloudflareEnv;
  return env;
};