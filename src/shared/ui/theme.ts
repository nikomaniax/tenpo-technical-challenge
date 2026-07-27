export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;

const palette = {
  light: {
    bg: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceAlt: '#EDEFF3',
    border: '#DDE1E8',
    text: '#12151A',
    textMuted: '#5C6675',
    textInverse: '#FFFFFF',
    primary: '#3B5BDB',
    primaryPressed: '#2F49AE',
    danger: '#D93A3A',
    success: '#2F9E5F',
    skeleton: '#E3E6EC',
  },
  dark: {
    bg: '#0E1116',
    surface: '#161A21',
    surfaceAlt: '#1F242D',
    border: '#2A303A',
    text: '#F2F4F8',
    textMuted: '#9AA4B2',
    textInverse: '#0E1116',
    primary: '#5C7CFA',
    primaryPressed: '#4763D6',
    danger: '#F06B6B',
    success: '#4ECB79',
    skeleton: '#20252E',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type Colors = (typeof palette)[ColorScheme];

export type Theme = {
  scheme: ColorScheme;
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export function buildTheme(scheme: ColorScheme): Theme {
  return { scheme, colors: palette[scheme], spacing, radius, typography };
}
