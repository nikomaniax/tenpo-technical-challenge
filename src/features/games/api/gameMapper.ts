import type { Game, GamesPage } from '../model/game';

export type RawgGameDto = {
  id: number;
  name: string;
  released: string | null;
  rating: number;
  background_image: string | null;
  genres?: { id: number; name: string }[];
};

export type RawgPageDto = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGameDto[];
};

const MEDIA_PREFIX = 'https://media.rawg.io/media/';
const RESIZE_SEGMENT = 'resize/420/-/';

export function toThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.startsWith(MEDIA_PREFIX)) return url;

  const path = url.slice(MEDIA_PREFIX.length);
  if (path.startsWith('resize/')) return url;

  return `${MEDIA_PREFIX}${RESIZE_SEGMENT}${path}`;
}

export function toGame(dto: RawgGameDto): Game {
  return {
    id: dto.id,
    name: dto.name,
    releaseYear: dto.released ? dto.released.slice(0, 4) : null,
    rating: dto.rating > 0 ? dto.rating : null,
    thumbnailUrl: toThumbnailUrl(dto.background_image),
    genres: dto.genres?.map((genre) => genre.name) ?? [],
  };
}

export function toGamesPage(dto: RawgPageDto): GamesPage {
  return {
    games: dto.results.map(toGame),
    hasNextPage: dto.next !== null,
    totalCount: dto.count,
  };
}
