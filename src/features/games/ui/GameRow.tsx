import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, useTheme } from '@/shared/ui';

import type { Game } from '../model/game';

export const GAME_ROW_HEIGHT = 88;

const THUMB_WIDTH = 104;
const THUMB_HEIGHT = 60;

type GameRowProps = {
  game: Game;
};

function GameRowComponent({ game }: GameRowProps) {
  const theme = useTheme();

  const subtitle = [game.releaseYear, ...game.genres.slice(0, 2)]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Image
        source={game.thumbnailUrl}
        recyclingKey={String(game.id)}
        style={[
          styles.thumb,
          {
            backgroundColor: theme.colors.skeleton,
            borderRadius: theme.radius.sm,
          },
        ]}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        accessibilityIgnoresInvertColors
      />

      <View style={styles.info}>
        <Text variant="label" numberOfLines={1}>
          {game.name}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {game.rating !== null ? (
        <Text variant="caption" tone="textMuted">
          {'★'} {game.rating.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: GAME_ROW_HEIGHT - 8,
  },
  thumb: {
    height: THUMB_HEIGHT,
    width: THUMB_WIDTH,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});

export const GameRow = memo(GameRowComponent);
