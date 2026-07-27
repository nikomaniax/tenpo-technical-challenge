import { ActivityIndicator, View } from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export type ListFooterProps = {
  loading: boolean;
  exhausted?: boolean;
};

export function ListFooter({ loading, exhausted = false }: ListFooterProps) {
  const theme = useTheme();

  if (!loading && !exhausted) return null;

  return (
    <View
      style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}
      accessibilityRole="progressbar"
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <Text variant="caption" tone="textMuted">
          No hay mas resultados
        </Text>
      )}
    </View>
  );
}
