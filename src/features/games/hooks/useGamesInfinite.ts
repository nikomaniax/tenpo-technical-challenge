import { useInfiniteQuery } from '@tanstack/react-query';

import { gameKeys } from '../api/gameKeys';
import { DEFAULT_ORDERING, fetchGamesPage } from '../api/gamesApi';
import type { Game } from '../model/game';

export type UseGamesInfiniteResult = {
  games: Game[];
  totalCount: number;
};

export function getNextPageParam(
  lastPage: { hasNextPage: boolean },
  _allPages: unknown[],
  lastPageParam: number
): number | undefined {
  return lastPage.hasNextPage ? lastPageParam + 1 : undefined;
}

export function useGamesInfinite() {
  return useInfiniteQuery({
    queryKey: gameKeys.list({ ordering: DEFAULT_ORDERING }),

    queryFn: ({ pageParam, signal }) => fetchGamesPage({ page: pageParam, signal }),

    initialPageParam: 1,
    getNextPageParam,

    select: (data): UseGamesInfiniteResult => ({
      games: data.pages.flatMap((page) => page.games),
      totalCount: data.pages[0]?.totalCount ?? 0,
    }),
  });
}
