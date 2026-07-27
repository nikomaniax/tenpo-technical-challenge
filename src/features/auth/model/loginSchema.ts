import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'El correo es obligatorio.' })
    .pipe(z.email({ error: 'Ingresa un correo valido.' })),
  password: z
    .string()
    .min(1, { error: 'La contrasena es obligatoria.' })
    .min(6, { error: 'La contrasena debe tener al menos 6 caracteres.' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
