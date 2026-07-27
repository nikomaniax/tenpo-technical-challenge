import { View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Algo salio mal',
  message,
  onRetry,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.spacing.sm,
        justifyContent: 'center',
        padding: theme.spacing.xl,
      }}
    >
      <Text variant="heading">{title}</Text>
      <Text tone="textMuted" style={{ textAlign: 'center' }}>
        {message}
      </Text>

      {onRetry ? (
        <View style={{ marginTop: theme.spacing.md, alignSelf: 'stretch' }}>
          <Button title="Reintentar" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
