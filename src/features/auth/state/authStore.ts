import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setUnauthorizedHandler } from '@/shared/api/httpClient';
import { queryClient } from '@/shared/api/queryClient';
import { secureStorage } from '@/shared/storage/secureStorage';

import { InvalidCredentialsError, login as loginRequest, type User } from '../api/authService';
import type { LoginInput } from '../model/loginSchema';

export type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated';

export type AuthState = {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  error: string | null;
  hydrated: boolean;

  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const STORAGE_KEY = 'tenpo.auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: 'unauthenticated',
      error: null,
      hydrated: false,

      login: async (input) => {
        set({ status: 'authenticating', error: null });

        try {
          const session = await loginRequest(input);
          set({
            token: session.token,
            user: session.user,
            status: 'authenticated',
            error: null,
          });
        } catch (error) {
          const message =
            error instanceof InvalidCredentialsError
              ? error.message
              : 'No pudimos iniciar sesion. Intenta de nuevo.';

          set({ token: null, user: null, status: 'unauthenticated', error: message });
        }
      },

      logout: () => {
        set({ token: null, user: null, status: 'unauthenticated', error: null });

        queryClient.clear();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),

      partialize: (state) => ({ token: state.token, user: state.user }),

      onRehydrateStorage: () => (state, error) => {
        useAuthStore.setState({
          hydrated: true,
          status: !error && state?.token ? 'authenticated' : 'unauthenticated',
        });
      },
    }
  )
);

setUnauthorizedHandler(() => useAuthStore.getState().logout());

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.status === 'authenticated');

export const useAuthHydrated = () => useAuthStore((state) => state.hydrated);

export const useCurrentUser = () => useAuthStore((state) => state.user);
