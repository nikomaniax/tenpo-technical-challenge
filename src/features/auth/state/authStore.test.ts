import { queryClient } from '@/shared/api/queryClient';

import { DEMO_CREDENTIALS } from '../api/authService';
import { useAuthStore } from './authStore';

function resetStore() {
  useAuthStore.setState({
    token: null,
    user: null,
    status: 'unauthenticated',
    error: null,
    hydrated: true,
  });
}

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
    jest.restoreAllMocks();
  });

  it('pasa por authenticating y termina autenticado con las credenciales demo', async () => {
    const promise = useAuthStore.getState().login({ ...DEMO_CREDENTIALS });

    expect(useAuthStore.getState().status).toBe('authenticating');

    await promise;

    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.token).toEqual(expect.any(String));
    expect(state.user?.email).toBe(DEMO_CREDENTIALS.email);
    expect(state.error).toBeNull();
  });

  it('ignora mayusculas y espacios sobrantes en el correo', async () => {
    await useAuthStore.getState().login({
      email: `  ${DEMO_CREDENTIALS.email.toUpperCase()} `,
      password: DEMO_CREDENTIALS.password,
    });

    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('deja la sesion vacia y expone un mensaje cuando las credenciales no coinciden', async () => {
    await useAuthStore.getState().login({
      email: DEMO_CREDENTIALS.email,
      password: 'contrasena-incorrecta',
    });

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.error).toBe('Correo o contrasena incorrectos.');
  });

  it('limpia la cache de queries al cerrar sesion', async () => {
    const clear = jest.spyOn(queryClient, 'clear');
    await useAuthStore.getState().login({ ...DEMO_CREDENTIALS });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.token).toBeNull();
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('clearError borra el mensaje sin tocar el resto del estado', async () => {
    await useAuthStore.getState().login({ email: 'otro@correo.com', password: 'noimporta' });
    expect(useAuthStore.getState().error).not.toBeNull();

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});
