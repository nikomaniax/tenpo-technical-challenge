import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInput as TextInputType,
  type TextInputProps,
} from 'react-native';

import { Text } from './Text';
import { useTheme } from './ThemeProvider';

export type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export const Input = forwardRef<TextInputType, InputProps>(function Input(
  { label, error, style, ...rest },
  ref
) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="label" tone="textMuted">
        {label}
      </Text>

      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          theme.typography.body,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.md,
          },
          style,
        ]}
        {...rest}
      />

      {error ? (
        <Text variant="caption" tone="danger" role="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
});
