import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from './ThemeProvider';
import type { Colors, typography } from './theme';

type Variant = keyof typeof typography;
type Tone = Extract<keyof Colors, 'text' | 'textMuted' | 'textInverse' | 'danger' | 'success'>;

export type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
};

export function Text({ variant = 'body', tone = 'text', style, ...rest }: TextProps) {
  const theme = useTheme();

  return (
    <RNText
      style={[theme.typography[variant], { color: theme.colors[tone] }, style]}
      {...rest}
    />
  );
}
