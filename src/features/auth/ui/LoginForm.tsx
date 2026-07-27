import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View, type TextInput } from 'react-native';

import { Button, Input, Text, useTheme } from '@/shared/ui';

import { DEMO_CREDENTIALS } from '../api/authService';
import { loginSchema, type LoginInput } from '../model/loginSchema';
import { useAuthStore } from '../state/authStore';

export function LoginForm() {
  const theme = useTheme();
  const passwordRef = useRef<TextInput>(null);

  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const submitError = useAuthStore((state) => state.error);
  const isSubmitting = useAuthStore((state) => state.status === 'authenticating');

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await login(values);
  });

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Correo"
            value={value}
            onChangeText={(next) => {
              if (submitError) clearError();
              onChange(next);
            }}
            onBlur={onBlur}
            error={formState.errors.email?.message}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            editable={!isSubmitting}
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="tu@correo.com"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            ref={passwordRef}
            label="Contrasena"
            value={value}
            onChangeText={(next) => {
              if (submitError) clearError();
              onChange(next);
            }}
            onBlur={onBlur}
            error={formState.errors.password?.message}
            autoCapitalize="none"
            autoComplete="current-password"
            secureTextEntry
            returnKeyType="go"
            editable={!isSubmitting}
            onSubmitEditing={onSubmit}
            placeholder="********"
          />
        )}
      />

      {submitError ? (
        <Text tone="danger" variant="caption" role="alert">
          {submitError}
        </Text>
      ) : null}

      <Button
        title="Iniciar sesion"
        onPress={onSubmit}
        loading={isSubmitting}
        accessibilityLabel="Iniciar sesion"
      />
    </View>
  );
}
