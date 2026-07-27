import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { toUserMessage } from '@/shared/api/httpClient';
import { ErrorState, ListFooter, useTheme } from '@/shared/ui';

import { useGamesInfinite } from '../hooks/useGamesInfinite';
import type { Game } from '../model/game';
import { GAME_ROW_HEIGHT, GameRow } from './GameRow';

export function GameList() {
  const theme = useTheme();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch,
  } = useGamesInfinite();

  const renderItem = useCallback(
    ({ item }: { item: Game }) => <GameRow game={item} />,
    []
  );

  const keyExtractor = useCallback((item: Game) => String(item.id), []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (error && !data) {
    return <ErrorState message={toUserMessage(error)} onRetry={() => refetch()} />;
  }

  return (
    <FlashList
      data={data?.games ?? []}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      drawDistance={GAME_ROW_HEIGHT * 6}
      contentContainerStyle={{ padding: theme.spacing.lg }}
      ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
      ListFooterComponent={
        <ListFooter
          loading={isFetchingNextPage}
          exhausted={!hasNextPage && (data?.games.length ?? 0) > 0}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      testID="game-list"
    />
  );
}
