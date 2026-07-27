import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/shared/test/renderWithProviders';

import { DEMO_CREDENTIALS } from '../api/authService';
import { useAuthStore } from '../state/authStore';
import { LoginForm } from './LoginForm';

const realLogin = useAuthStore.getState().login;
const realClearError = useAuthStore.getState().clearError;

function resetStore(overrides: Partial<ReturnType<typeof useAuthStore.getState>> = {}) {
  useAuthStore.setState({
    token: null,
    user: null,
    status: 'unauthenticated',
    error: null,
    hydrated: true,
    login: realLogin,
    clearError: realClearError,
    ...overrides,
  });
}

describe('LoginForm', () => {
  beforeEach(() => resetStore());

  it('precarga las credenciales demo para que evaluarlo sea un solo toque', async () => {
    await renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText('Correo').props.value).toBe(DEMO_CREDENTIALS.email);
    expect(screen.getByLabelText('Contrasena').props.value).toBe(
      DEMO_CREDENTIALS.password
    );
  });

  it('bloquea el envio y muestra el error de validacion si el correo no es valido', async () => {
    const login = jest.fn();
    resetStore({ login });

    await renderWithProviders(<LoginForm />);

    await fireEvent.changeText(screen.getByLabelText('Correo'), 'esto-no-es-un-correo');
    await fireEvent.press(screen.getByLabelText('Iniciar sesion'));

    expect(await screen.findByText('Ingresa un correo valido.')).toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();
  });

  it('exige una contrasena de al menos 6 caracteres', async () => {
    const login = jest.fn();
    resetStore({ login });

    await renderWithProviders(<LoginForm />);

    await fireEvent.changeText(screen.getByLabelText('Contrasena'), 'abc');
    await fireEvent.press(screen.getByLabelText('Iniciar sesion'));

    expect(
      await screen.findByText('La contrasena debe tener al menos 6 caracteres.')
    ).toBeOnTheScreen();
    expect(login).not.toHaveBeenCalled();
  });

  it('envia las credenciales cuando el formulario es valido', async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    resetStore({ login });

    await renderWithProviders(<LoginForm />);
    await fireEvent.press(screen.getByLabelText('Iniciar sesion'));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
      })
    );
  });

  it('muestra el error que reporta el store tras un intento fallido', async () => {
    resetStore({ error: 'Correo o contrasena incorrectos.' });

    await renderWithProviders(<LoginForm />);

    expect(screen.getByText('Correo o contrasena incorrectos.')).toBeOnTheScreen();
  });

  it('deshabilita el boton mientras la peticion esta en vuelo', async () => {
    resetStore({ status: 'authenticating' });

    await renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText('Iniciar sesion')).toBeDisabled();
  });
});
