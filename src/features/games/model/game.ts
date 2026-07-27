export type Game = {
  id: number;
  name: string;
  releaseYear: string | null;
  rating: number | null;
  thumbnailUrl: string | null;
  genres: string[];
};

export type GamesPage = {
  games: Game[];
  hasNextPage: boolean;
  totalCount: number;
};
