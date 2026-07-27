import { z } from 'zod';

const envSchema = z.object({
  RAWG_API_KEY: z
    .string()
    .min(1, 'Falta EXPO_PUBLIC_RAWG_API_KEY. Copia .env.example a .env y pon tu key de https://rawg.io/apidocs')
    .refine((value) => value !== 'tu_api_key_aqui', {
      error:
        'EXPO_PUBLIC_RAWG_API_KEY sigue con el valor de ejemplo. Pon tu key real de https://rawg.io/apidocs',
    }),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    RAWG_API_KEY: process.env.EXPO_PUBLIC_RAWG_API_KEY,
  });

  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => issue.message).join('\n');
    throw new Error(`Configuracion invalida:\n${detail}`);
  }

  cached = parsed.data;
  return cached;
}

export function resetEnvCache() {
  cached = null;
}
