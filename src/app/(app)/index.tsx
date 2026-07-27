import { Pressable, View } from 'react-native';

import { useAuthStore, useCurrentUser } from '@/features/auth/state/authStore';
import { useGamesInfinite } from '@/features/games/hooks/useGamesInfinite';
import { GameList } from '@/features/games/ui/GameList';
import { Screen, Text, useTheme } from '@/shared/ui';

export default function HomeScreen() {
  const theme = useTheme();
  const user = useCurrentUser();
  const logout = useAuthStore((state) => state.logout);

  const { data } = useGamesInfinite();

  return (
    <Screen padded={false}>
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          gap: theme.spacing.md,
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading">Catalogo</Text>
          <Text variant="caption" tone="textMuted">
            {data
              ? `${data.games.length} de ${data.totalCount.toLocaleString('es')} juegos`
              : 'Cargando catalogo...'}
          </Text>
        </View>

        <Pressable
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesion"
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="label" tone="danger">
            Salir
          </Text>
        </Pressable>
      </View>

      {user ? (
        <Text
          variant="caption"
          tone="textMuted"
          style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xs }}
        >
          Sesion de {user.email}
        </Text>
      ) : null}

      <View style={{ flex: 1, paddingTop: theme.spacing.sm }}>
        <GameList />
      </View>
    </Screen>
  );
}
