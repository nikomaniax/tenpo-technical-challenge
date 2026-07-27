import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { LoginForm } from '@/features/auth/ui/LoginForm';
import { Screen, Text, useTheme } from '@/shared/ui';

export default function LoginScreen() {
  const theme = useTheme();

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: theme.spacing.xl,
            gap: theme.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="title">Tenpo Games</Text>
            <Text tone="textMuted">
              Inicia sesion para explorar el catalogo.
            </Text>
          </View>

          <LoginForm />

          <View
            style={{
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              gap: theme.spacing.xs,
            }}
          >
            <Text variant="label" tone="textMuted">
              Credenciales de prueba
            </Text>
            <Text variant="caption" tone="textMuted">
              demo@tenpo.com / Demo1234 (ya vienen precargadas)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
