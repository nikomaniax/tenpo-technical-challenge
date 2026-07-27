import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.md + 2,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: isPrimary
            ? pressed
              ? theme.colors.primaryPressed
              : theme.colors.primary
            : 'transparent',
          borderWidth: isPrimary ? 0 : StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.5 : 1,
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? theme.colors.textInverse : theme.colors.text}
        />
      ) : (
        <Text variant="label" tone={isPrimary ? 'textInverse' : 'text'}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
