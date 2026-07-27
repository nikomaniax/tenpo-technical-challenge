import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';

export type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
};

export function Screen({
  children,
  padded = true,
  edges = ['top', 'bottom'],
  style,
}: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
    >
      <View style={[styles.content, padded && { padding: theme.spacing.xl }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
