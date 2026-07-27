import type { LoginInput } from '../model/loginSchema';

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Session = {
  token: string;
  user: User;
};

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contrasena incorrectos.');
    this.name = 'InvalidCredentialsError';
  }
}

export const DEMO_CREDENTIALS = {
  email: 'demo@tenpo.com',
  password: 'Demo1234',
} as const;

const FAKE_LATENCY_MS = 800;

export async function login(input: LoginInput): Promise<Session> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));

  const email = input.email.trim().toLowerCase();
  const matches =
    email === DEMO_CREDENTIALS.email && input.password === DEMO_CREDENTIALS.password;

  if (!matches) {
    throw new InvalidCredentialsError();
  }

  return {
    token: createFakeToken(email),
    user: {
      id: 'usr_demo_001',
      email: DEMO_CREDENTIALS.email,
      name: 'Persona Evaluadora',
    },
  };
}

function createFakeToken(subject: string): string {
  const random = Math.random().toString(36).slice(2);
  return `demo.${subject.replace(/[^a-z0-9]/gi, '')}.${random}${Date.now().toString(36)}`;
}
