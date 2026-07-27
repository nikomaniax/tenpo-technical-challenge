import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('acepta credenciales bien formadas', () => {
    const result = loginSchema.safeParse({
      email: 'demo@tenpo.com',
      password: 'Demo1234',
    });

    expect(result.success).toBe(true);
  });

  it('rechaza un correo sin formato valido', () => {
    const result = loginSchema.safeParse({ email: 'demo-arroba', password: 'Demo1234' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Ingresa un correo valido.');
  });

  it('distingue el campo vacio del campo mal formado', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Demo1234' });

    expect(result.error?.issues[0].message).toBe('El correo es obligatorio.');
  });

  it('exige al menos 6 caracteres de contrasena', () => {
    const result = loginSchema.safeParse({ email: 'demo@tenpo.com', password: 'abc' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'La contrasena debe tener al menos 6 caracteres.'
    );
  });
});
