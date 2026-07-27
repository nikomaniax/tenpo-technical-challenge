import { httpGet } from '@/shared/api/httpClient';
import { getEnv } from '@/shared/config/env';

import type { GamesPage } from '../model/game';
import { toGamesPage, type RawgPageDto } from './gameMapper';

const BASE_URL = 'https://api.rawg.io/api';

export const PAGE_SIZE = 40;

export const DEFAULT_ORDERING = '-added';

export type FetchGamesParams = {
  page: number;
  ordering?: string;
  signal?: AbortSignal;
};

export async function fetchGamesPage({
  page,
  ordering = DEFAULT_ORDERING,
  signal,
}: FetchGamesParams): Promise<GamesPage> {
  const query = new URLSearchParams({
    key: getEnv().RAWG_API_KEY,
    page: String(page),
    page_size: String(PAGE_SIZE),
    ordering,
  });

  const dto = await httpGet<RawgPageDto>(`${BASE_URL}/games?${query}`, { signal });
  return toGamesPage(dto);
}
